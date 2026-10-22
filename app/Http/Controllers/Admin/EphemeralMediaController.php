<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EphemeralMedia;
use App\Services\EphemeralReportService;
use App\Services\MediaDeletionService;
use App\Services\ModerationAuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EphemeralMediaController extends Controller
{
    /**
     * Ephemeral oversight: aggregate counters, plus the flagged queue.
     *
     * Every attachment is examined before delivery. After a decision, private
     * content can only be consulted again when it has been reported.
     */
    public function index(): Response
    {
        $pending = EphemeralMedia::with(['sender:id,pseudo', 'recipient:id,pseudo'])
            ->where('moderation_status', 'pending')->stored()->oldest()->limit(50)->get()
            ->map(fn (EphemeralMedia $medium) => [
                'id' => $medium->id,
                'type' => $medium->type,
                'is_naughty' => $medium->is_naughty,
                'sender' => $medium->sender,
                'recipient' => $medium->recipient,
                'sent_at' => $medium->created_at->toISOString(),
                'processing_status' => $medium->processing_status,
            ]);

        $flagged = EphemeralMedia::with([
            'sender:id,pseudo',
            'recipient:id,pseudo',
        ])
            ->where('is_flagged', true)
            ->stored()
            ->latest()
            ->get()
            ->map(fn (EphemeralMedia $medium) => [
                'id' => $medium->id,
                'type' => $medium->type,
                'is_naughty' => $medium->is_naughty,
                'sender' => $medium->sender,
                'recipient' => $medium->recipient,
                'sent_at' => $medium->created_at->toISOString(),
                'first_viewed_at' => $medium->first_viewed_at?->toISOString(),
                'purge_after' => $medium->purge_after->toISOString(),
            ]);

        return Inertia::render('Admin/Ephemeral/Index', [
            'flagged' => $flagged,
            'pending' => $pending,
            'stats' => [
                'sent_total' => EphemeralMedia::count(),
                'sent_last_30_days' => EphemeralMedia::where('created_at', '>=', now()->subDays(30))->count(),
                'photos' => EphemeralMedia::where('type', 'photo')->count(),
                'videos' => EphemeralMedia::where('type', 'video')->count(),
                'opened' => EphemeralMedia::whereNotNull('first_viewed_at')->count(),
                'never_opened' => EphemeralMedia::whereNull('first_viewed_at')->stored()->count(),
                'replayed' => EphemeralMedia::whereNotNull('replayed_at')->count(),
                'flagged_open' => EphemeralMedia::where('is_flagged', true)->stored()->count(),
                'purged' => EphemeralMedia::whereNotNull('purged_at')->count(),
                'pending_moderation' => EphemeralMedia::where('moderation_status', 'pending')->stored()->count(),
            ],
        ]);
    }

    /**
     * Stream a medium awaiting validation or preserved for an open report.
     */
    public function show(Request $request, EphemeralMedia $medium): StreamedResponse
    {
        abort_unless($medium->is_flagged || $medium->moderation_status === 'pending', 403, 'La consultation est réservée à une validation en attente ou un signalement.');
        abort_if($medium->purged_at !== null, 410, 'Ce contenu a été supprimé.');
        abort_if($medium->processing_status !== 'ready', 425, 'Ce contenu est encore en préparation.');

        abort_unless(Storage::disk('local')->exists($medium->path), 410, 'Fichier introuvable.');
        app(ModerationAuditService::class)->record(
            $request->user(),
            $medium,
            $medium->is_flagged ? 'ephemeral_reviewed' : 'ephemeral_prepublication_reviewed',
            $medium->sender
        );

        return Storage::disk('local')->response($medium->path, null, [
            'Content-Type' => $medium->type === 'video' ? 'video/mp4' : 'image/jpeg',
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function approve(Request $request, EphemeralMedia $medium): RedirectResponse
    {
        $request->validate(['review_confirmed' => ['accepted']]);
        DB::transaction(function () use ($request, $medium) {
            $current = EphemeralMedia::query()->lockForUpdate()->findOrFail($medium->id);
            abort_unless($current->moderation_status === 'pending' && $current->purged_at === null, 409);
            abort_unless($current->processing_status === 'ready' && Storage::disk('local')->exists($current->path), 422, 'Le média doit être prêt et disponible pour être examiné.');
            $current->update([
                'moderation_status' => 'approved', 'moderated_at' => now(),
                'moderator_id' => $request->user()->id, 'moderation_reason' => null,
            ]);
            app(ModerationAuditService::class)->record($request->user(), $current, 'ephemeral_approved', $current->sender);
        });

        return back()->with('success', 'Média validé. Les autres contrôles d’accès et de consentement restent applicables.');
    }

    public function reject(Request $request, EphemeralMedia $medium): RedirectResponse
    {
        $validated = $request->validate(['reason' => ['required', 'string', 'min:3', 'max:500']]);
        DB::transaction(function () use ($request, $medium, $validated) {
            $current = EphemeralMedia::query()->lockForUpdate()->findOrFail($medium->id);
            abort_unless($current->moderation_status === 'pending' && $current->purged_at === null, 409);
            $current->update([
                'moderation_status' => 'rejected', 'moderated_at' => now(),
                'moderator_id' => $request->user()->id, 'moderation_reason' => $validated['reason'],
            ]);
            app(ModerationAuditService::class)->record($request->user(), $current, 'ephemeral_rejected', $current->sender, 'content_rejected', $validated['reason']);
        });

        return back()->with('success', 'Média refusé. Il ne sera pas diffusé à la destinataire.');
    }

    /**
     * Close a report: the media returns to the normal purge cycle.
     */
    public function dismiss(Request $request, EphemeralMedia $medium): RedirectResponse
    {
        abort_unless($medium->is_flagged, 403);
        $validated = $request->validate(['reason' => ['required', 'string', 'min:3', 'max:500']]);
        DB::transaction(function () use ($request, $medium, $validated) {
            app(EphemeralReportService::class)->resolveMedia($medium, 'dismissed', $validated['reason']);

            app(ModerationAuditService::class)->record(
                $request->user(),
                $medium,
                'ephemeral_report_dismissed',
                $medium->sender,
                'ephemeral_report_dismissed',
                $validated['reason']
            );
        });

        return back()->with('success', 'Signalement classé sans suite.');
    }

    /**
     * Remove the file immediately, ahead of its retention date.
     */
    public function destroy(Request $request, EphemeralMedia $medium): RedirectResponse
    {
        abort_unless($medium->is_flagged, 403);
        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:3', 'max:500'],
        ]);

        DB::transaction(function () use ($request, $medium, $validated) {
            $current = EphemeralMedia::query()->lockForUpdate()->findOrFail($medium->id);
            app(MediaDeletionService::class)->deleteEphemeral($current);
            $current->update(['purged_at' => now(), 'is_flagged' => false]);
            app(EphemeralReportService::class)->resolveMedia($current, 'actioned', $validated['reason']);

            app(ModerationAuditService::class)->record(
                $request->user(), $current, 'ephemeral_deleted', $current->sender, 'ephemeral_deleted', $validated['reason']
            );
        });

        return back()->with('success', 'Contenu supprimé.');
    }
}
