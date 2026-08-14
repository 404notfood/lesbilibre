<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\EphemeralMedia;
use App\Services\ModerationAuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class EphemeralMediaController extends Controller
{
    /**
     * Ephemeral oversight: aggregate counters, plus the flagged queue.
     *
     * Members are told nobody can look at their ephemeral content unless it is
     * reported. That promise is kept here: this screen exposes counts for
     * everything, and images only for what somebody flagged.
     */
    public function index(): Response
    {
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
            ],
        ]);
    }

    /**
     * Stream a flagged media to a moderator.
     *
     * Deliberately refuses anything that is not flagged: without a report
     * there is no legitimate reason for anybody to see this.
     */
    public function show(Request $request, EphemeralMedia $medium): HttpResponse
    {
        abort_unless($medium->is_flagged, 403, 'Ce contenu n’est consultable qu’en cas de signalement.');
        abort_if($medium->purged_at !== null, 410, 'Ce contenu a été supprimé.');

        $contents = Storage::disk('local')->get($medium->path);

        abort_if($contents === null, 410, 'Fichier introuvable.');

        app(ModerationAuditService::class)->record(
            $request->user(),
            $medium,
            'ephemeral_reviewed',
            $medium->sender
        );

        return response($contents, 200, [
            'Content-Type' => $medium->type === 'video' ? 'video/mp4' : 'image/jpeg',
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    /**
     * Close a report: the media returns to the normal purge cycle.
     */
    public function dismiss(Request $request, EphemeralMedia $medium): RedirectResponse
    {
        $medium->update(['is_flagged' => false]);

        app(ModerationAuditService::class)->record(
            $request->user(),
            $medium,
            'ephemeral_report_dismissed',
            $medium->sender
        );

        return back()->with('success', 'Signalement classé sans suite.');
    }

    /**
     * Remove the file immediately, ahead of its retention date.
     */
    public function destroy(Request $request, EphemeralMedia $medium): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        foreach (array_filter([$medium->path, $medium->thumbnail_path]) as $path) {
            Storage::disk('local')->delete($path);
        }

        $medium->update([
            'purged_at' => now(),
            'is_flagged' => false,
        ]);

        app(ModerationAuditService::class)->record(
            $request->user(),
            $medium,
            'ephemeral_deleted',
            $medium->sender,
            'ephemeral_deleted',
            $validated['reason']
        );

        return back()->with('success', 'Contenu supprimé.');
    }
}
