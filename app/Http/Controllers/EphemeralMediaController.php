<?php

namespace App\Http\Controllers;

use App\Jobs\TranscodeEphemeralVideo;
use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Services\EntitlementService;
use App\Services\GemService;
use App\Services\PhotoProcessingService;
use App\Services\VideoProcessingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
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

        abort_unless($user->canInteractWith($recipient), 403, 'Cette conversation n’est plus disponible.');

        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'mimes:jpeg,png,jpg,mp4,mov,quicktime',
                'max:'.config('media.ephemeral.max_video_kb'),
            ],
            'is_naughty' => ['boolean'],
        ]);

        $file = $request->file('file');
        $isVideo = str_starts_with((string) $file->getMimeType(), 'video/');

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
        $user = $request->user();

        abort_unless($medium->recipient_id === $user->id, 403);
        abort_if($medium->purged_at !== null, 410, 'Ce contenu n’est plus disponible.');
        abort_if($medium->processing_status !== 'ready', 425, 'Ce contenu est encore en préparation.');

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

        $contents = Storage::disk('local')->get($medium->path);

        abort_if($contents === null, 410, 'Ce contenu n’est plus disponible.');

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
     * Flagging freezes the retention clock and is the only thing that makes
     * the file visible to a moderator — that is the whole bargain we offer
     * members about ephemeral content.
     */
    public function report(Request $request, EphemeralMedia $medium): RedirectResponse
    {
        $user = $request->user();

        abort_unless($medium->recipient_id === $user->id, 403);

        $request->validate([
            'reason' => ['required', 'string', 'min:10', 'max:1000'],
        ]);

        $medium->update([
            'is_flagged' => true,
            // La rétention est gelée le temps du traitement.
            'purge_after' => now()->addDays(EphemeralMedia::RETENTION_DAYS),
        ]);

        \App\Models\Report::create([
            'reporter_id' => $user->id,
            'reported_user_id' => $medium->sender_id,
            'reason' => 'inappropriate_content',
            'description' => "[Contenu éphémère #{$medium->id}] ".$request->string('reason'),
        ]);

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
            'purge_after' => now()->addDays(EphemeralMedia::RETENTION_DAYS),
        ]);

        return back()->with('success', 'Photo éphémère envoyée.');
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
            'purge_after' => now()->addDays(EphemeralMedia::RETENTION_DAYS),
        ]);

        TranscodeEphemeralVideo::dispatch($media->id);

        return back()->with('success', 'Vidéo envoyée : elle sera disponible dans un instant.');
    }
}
