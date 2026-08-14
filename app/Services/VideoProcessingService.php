<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;

class VideoProcessingService
{
    /** Longest side of the re-encoded video. */
    private const MAX_HEIGHT = 720;

    /** Encoding a long clip must not tie up a worker forever. */
    private const TIMEOUT_SECONDS = 300;

    /**
     * Whether the server can process video at all.
     *
     * Checked before accepting an upload rather than after: telling somebody
     * their video failed once it is already sent is a poor trade.
     */
    public function isAvailable(): bool
    {
        return $this->binaryExists(config('media.ffmpeg_path'))
            && $this->binaryExists(config('media.ffprobe_path'));
    }

    /**
     * Duration in seconds, or null when it cannot be determined.
     */
    public function durationOf(string $absolutePath): ?float
    {
        $process = new Process([
            config('media.ffprobe_path'),
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            $absolutePath,
        ]);

        $process->setTimeout(30);
        $process->run();

        if (! $process->isSuccessful()) {
            return null;
        }

        $duration = trim($process->getOutput());

        return is_numeric($duration) ? (float) $duration : null;
    }

    /**
     * Re-encode a stored video to 720p H.264 and extract a poster frame.
     *
     * Phone footage routinely arrives as 4K HEVC weighing over 100 MB, which
     * many browsers refuse to play and every mobile connection struggles to
     * load. Normalising on upload is what makes the feature usable at all.
     *
     * @return array{path: string, thumbnail_path: string}
     */
    public function transcode(string $storedPath, string $disk = 'local'): array
    {
        if (! $this->isAvailable()) {
            throw new RuntimeException('ffmpeg n’est pas disponible sur ce serveur.');
        }

        $source = Storage::disk($disk)->path($storedPath);
        $name = Str::uuid();

        $videoTarget = sys_get_temp_dir().DIRECTORY_SEPARATOR.$name.'.mp4';
        $posterTarget = sys_get_temp_dir().DIRECTORY_SEPARATOR.$name.'.jpg';

        try {
            $this->run([
                config('media.ffmpeg_path'),
                '-y',
                '-i', $source,
                // Scale down only; never upscale a small clip.
                '-vf', 'scale=-2:\'min('.self::MAX_HEIGHT.',ih)\'',
                '-c:v', 'libx264',
                '-preset', 'veryfast',
                '-crf', '28',
                '-c:a', 'aac',
                '-b:a', '96k',
                // Metadata up front so playback can start before the full
                // download completes.
                '-movflags', '+faststart',
                // Strip location and device metadata along the way.
                '-map_metadata', '-1',
                $videoTarget,
            ]);

            $this->run([
                config('media.ffmpeg_path'),
                '-y',
                '-i', $videoTarget,
                '-frames:v', '1',
                '-q:v', '4',
                $posterTarget,
            ]);

            $finalVideo = 'ephemeral/'.$name.'.mp4';
            $finalPoster = 'ephemeral/'.$name.'.jpg';

            Storage::disk($disk)->put($finalVideo, file_get_contents($videoTarget));
            Storage::disk($disk)->put($finalPoster, file_get_contents($posterTarget));

            // The original is replaced by its normalised version.
            Storage::disk($disk)->delete($storedPath);

            return [
                'path' => $finalVideo,
                'thumbnail_path' => $finalPoster,
            ];
        } finally {
            @unlink($videoTarget);
            @unlink($posterTarget);
        }
    }

    private function run(array $command): void
    {
        $process = new Process($command);
        $process->setTimeout(self::TIMEOUT_SECONDS);

        try {
            $process->run();
        } catch (ProcessTimedOutException) {
            throw new RuntimeException('Le traitement de la vidéo a dépassé le temps imparti.');
        }

        if (! $process->isSuccessful()) {
            throw new RuntimeException(
                'Échec du traitement vidéo : '.trim($process->getErrorOutput())
            );
        }
    }

    private function binaryExists(string $binary): bool
    {
        $process = new Process([$binary, '-version']);
        $process->setTimeout(10);

        try {
            $process->run();
        } catch (\Throwable) {
            return false;
        }

        return $process->isSuccessful();
    }
}
