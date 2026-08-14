<?php

namespace App\Jobs;

use App\Models\EphemeralMedia;
use App\Services\VideoProcessingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class TranscodeEphemeralVideo implements ShouldQueue
{
    use Queueable;

    public int $tries = 2;

    public int $timeout = 600;

    public function __construct(public int $mediaId) {}

    /**
     * Normalise an uploaded clip so it plays everywhere.
     *
     * Until this succeeds the media stays in `pending` and is not served: an
     * unprocessed upload can be 4K HEVC that most browsers cannot decode.
     */
    public function handle(VideoProcessingService $videos): void
    {
        $media = EphemeralMedia::find($this->mediaId);

        if ($media === null || $media->processing_status !== 'pending') {
            return;
        }

        try {
            $result = $videos->transcode($media->path);

            $media->update([
                'path' => $result['path'],
                'thumbnail_path' => $result['thumbnail_path'],
                'processing_status' => 'ready',
            ]);
        } catch (\Throwable $e) {
            Log::error('Échec du transcodage éphémère', [
                'media_id' => $media->id,
                'message' => $e->getMessage(),
            ]);

            $media->update(['processing_status' => 'failed']);

            throw $e;
        }
    }

    /**
     * The clip will never be watchable, so its file is dead weight carrying
     * somebody's private content.
     */
    public function failed(\Throwable $exception): void
    {
        $media = EphemeralMedia::find($this->mediaId);

        if ($media === null) {
            return;
        }

        if ($media->path && Storage::disk('local')->exists($media->path)) {
            Storage::disk('local')->delete($media->path);
        }

        $media->update([
            'processing_status' => 'failed',
            'purged_at' => now(),
        ]);
    }
}
