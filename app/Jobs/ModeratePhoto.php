<?php

namespace App\Jobs;

use App\Models\Photo;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Throwable;

class ModeratePhoto implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly int $photoId) {}

    public function handle(): void
    {
        $photo = Photo::find($this->photoId);
        if (! $photo || $photo->moderation_status !== 'pending') {
            return;
        }

        $response = Http::timeout(30)
            ->withHeaders(['X-Moderation-Token' => config('services.moderation.token')])
            ->post(rtrim(config('services.moderation.url'), '/').'/classify', ['path' => $photo->path]);

        if (! $response->successful()) {
            throw new \RuntimeException('Local moderation service rejected the image.');
        }

        $scores = $response->json('scores', []);
        $nsfwScore = (float) ($scores['nsfw'] ?? 0);

        if ($nsfwScore >= config('services.moderation.quarantine_threshold')) {
            $photo->update([
                'moderation_status' => 'quarantined',
                'rejection_reason' => 'Photo mise en quarantaine pour vérification manuelle.',
            ]);
            logger()->warning('Photo quarantined by local moderation', ['photo_id' => $photo->id, 'score' => $nsfwScore]);
        }
    }

    public function failed(Throwable $exception): void
    {
        logger()->error('Local photo moderation failed', ['photo_id' => $this->photoId, 'error' => $exception->getMessage()]);
    }
}
