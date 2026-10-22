<?php

namespace App\Http\Controllers;

use App\Jobs\TranscodeEphemeralVideo;
use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Services\EntitlementService;
use App\Services\EphemeralReportService;
use App\Services\GemService;
use App\Services\PhotoProcessingService;
use App\Services\VideoProcessingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class EphemeralMediaController extends Controller
{
    public function __construct(
        protected EntitlementService $entitlements,
        protected VideoProcessingService $videos,
    ) {}

    /**
     * Send an ephemeral photo or video into a conversation.
     */
    public function store(Request $request, Conversation $conversation): RedirectResponse
    {
        $user = $request->user();

        abort_unless(
            $conversation->user1_id === $user->id || $conversation->user2_id === $user->id,
            403,
            'Vous n’avez pas accès à cette conversation.'
        );

        $recipient = $conversation->user1_id === $user->id
            ? $conversation->user2
            : $conversation->user1;

        abort_unless($recipient && $user->canInteractWith($recipient), 403, 'Cette conversation n’est plus disponible.');

        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpeg,png,jpg,mp4,mov,quicktime',
                'max:'.config('media.ephemeral.max_video_kb'),
            ],
            'is_naughty' => ['boolean'],
        ]);

        abort_if($request->boolean('is_naughty') && (! $conversation->acceptsIntimateMedia($recipient->id) || in_array('no_sexual_requests', $recipient->profile?->boundaries ?? [], true) || in_array('friendship_only', $recipient->profile?->boundaries ?? [], true)), 403, 'Cette personne n’autorise pas les médias intimes dans cette conversation.');

        $file = $request->file('file');
        $isVideo = str_starts_with((string) $file->getMimeType(), 'video/');

        if (! $isVideo) {
            $request->validate(['file' => [new \App\Rules\SafeImageDimensions]]);
        }

        if ($isVideo) {
            return $this->storeVideo($request, $conversation, $recipient->id, $file, $validated);
        }

        return $this->storePhoto($request, $conversation, $recipient->id, $file, $validated);
    }

    /**
     * Open an ephemeral media. First view is free; a second one is a replay.
     */
    public function show(Request $request, EphemeralMedia $medium): Response
    {
        return DB::transaction(function () use ($request, $medium) {
            $current = EphemeralMedia::query()->lockForUpdate()->findOrFail($medium->id);

            return $this->openMedia($request, $current);
        });
    }

    private function openMedia(Request $request, EphemeralMedia $medium): Response
    {
        $user = $request->user();

        abort_unless($medium->recipient_id === $user->id, 403);
        abort_unless($medium->sender && $user->canInteractWith($medium->sender), 403);
        abort_if($medium->is_naughty && (! $medium->conversation->acceptsIntimateMedia($user->id) || in_array('no_sexual_requests', $user->profile?->boundaries ?? [], true) || in_array('friendship_only', $user->profile?->boundaries ?? [], true)), 403, 'Autorisez explicitement les médias intimes dans cette conversation pour ouvrir ce contenu.');
        abort_if($medium->purged_at !== null, 410, 'Ce contenu n’est plus disponible.');
        abort_if($medium->moderation_status !== 'approved', 403, 'Ce contenu doit être validé par la modération avant sa diffusion.');
        abort_if($medium->processing_status !== 'ready', 425, 'Ce contenu est encore en préparation.');

        $contents = Storage::disk('local')->get($medium->path);
        abort_if($contents === null, 410, 'Ce contenu n’est plus disponible.');

        if ($medium->wouldBeReplay()) {
            abort_unless(
                $medium->replayedAtIsUnused() && $medium->replayWindowIsOpen(),
                410,
                'Ce contenu a déjà été revu.'
            );

            $this->chargeReplay($user, $medium);
            $medium->markReplayed();
        } else {
            $medium->markFirstView();
        }

        return response($contents, 200, [
            'Content-Type' => $medium->type === 'video' ? 'video/mp4' : 'image/jpeg',
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Disposition' => 'inline',
        ]);
    }

    /**
     * Report an ephemeral media.
     *
     * Flagging preserves evidence after prepublication review and permits
     * a moderator to consult it again while the report remains open.
     */
    public function report(Request $request, EphemeralMedia $medium): RedirectResponse
    {
        $user = $request->user();

        abort_unless($medium->recipient_id === $user->id, 403);

        $request->validate([
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        app(EphemeralReportService::class)->report($medium, $user, $request->string('reason')->toString());

        return back()->with(
            'success',
            'Signalement transmis. Notre équipe examinera ce contenu.'
        );
    }

    /**
     * Deduct the replay cost, unless the member's plan covers it.
     */
    private function chargeReplay(\App\Models\User $user, EphemeralMedia $medium): void
    {
        if ($this->entitlements->allows($user, 'free_replays')) {
            return;
        }

        $cost = (int) config('media.ephemeral.replay_cost_gems');

        if ($cost <= 0) {
            return;
        }

        if ($user->gems < $cost) {
            abort(402, 'Vous n’avez pas assez de gemmes pour revoir ce contenu.');
        }

        $transaction = app(GemService::class)->deductGems(
            $user,
            $cost,
            'ephemeral_replay',
            'ephemeral_replay',
            'Revoir un contenu éphémère',
            ['media_id' => $medium->id]
        );

        abort_if($transaction === null, 402, 'Vous n’avez pas assez de gemmes pour revoir ce contenu.');
    }

    private function storePhoto(
        Request $request,
        Conversation $conversation,
        int $recipientId,
        $file,
        array $validated,
    ): RedirectResponse {
        if ($file->getSize() > config('media.ephemeral.max_photo_kb') * 1024) {
            throw ValidationException::withMessages([
                'file' => 'La photo ne peut pas dépasser '.
                    round(config('media.ephemeral.max_photo_kb') / 1024).' Mo.',
            ]);
        }

        // Ré-encodée pour retirer les métadonnées (dont la position GPS).
        $path = app(PhotoProcessingService::class)->storePrivateEphemeral($file);

        EphemeralMedia::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'recipient_id' => $recipientId,
            'type' => 'photo',
            'path' => $path,
            'is_naughty' => (bool) ($validated['is_naughty'] ?? false),
            'processing_status' => 'ready',
            'moderation_status' => 'pending',
            'purge_after' => now()->addDays(EphemeralMedia::RETENTION_DAYS),
        ]);

        return back()->with('success', 'Photo déposée. Elle sera visible après validation de la modération.');
    }

    private function storeVideo(
        Request $request,
        Conversation $conversation,
        int $recipientId,
        $file,
        array $validated,
    ): RedirectResponse {
        if (! $this->videos->isAvailable()) {
            throw ValidationException::withMessages([
                'file' => 'L’envoi de vidéos est momentanément indisponible.',
            ]);
        }

        $duration = $this->videos->durationOf($file->getRealPath());
        $maxSeconds = (int) config('media.ephemeral.max_video_seconds');

        if ($duration !== null && $duration > $maxSeconds) {
            throw ValidationException::withMessages([
                'file' => "La vidéo ne peut pas dépasser {$maxSeconds} secondes.",
            ]);
        }

        $path = 'ephemeral/raw/'.Str::uuid().'.'.$file->getClientOriginalExtension();
        Storage::disk('local')->put($path, file_get_contents($file->getRealPath()));

        $media = EphemeralMedia::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'recipient_id' => $recipientId,
            'type' => 'video',
            'path' => $path,
            'is_naughty' => (bool) ($validated['is_naughty'] ?? false),
            'processing_status' => 'pending',
            'moderation_status' => 'pending',
            'purge_after' => now()->addDays(EphemeralMedia::RETENTION_DAYS),
        ]);

        TranscodeEphemeralVideo::dispatch($media->id);

        return back()->with('success', 'Vidéo déposée : préparation puis validation de la modération avant sa diffusion.');
    }
}
