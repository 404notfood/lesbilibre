<?php

namespace App\Services;

use App\Models\EphemeralMedia;
use App\Models\Photo;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class MediaDeletionService
{
    public function deletePath(string $diskName, ?string $path): void
    {
        if (blank($path)) {
            return;
        }
        $disk = Storage::disk($diskName);
        if ($disk->exists($path) && ! $disk->delete($path)) {
            throw new RuntimeException('Le stockage a refusé la suppression d’un fichier.');
        }
    }

    /** Remove bytes first; callers remove the row only after success. */
    public function deletePhoto(Photo $photo): void
    {
        $disk = $photo->isVideo() ? 'local' : 'public';
        $this->deletePath($disk, $photo->path);
        $this->deletePath($disk, $photo->thumbnail_path);
        $this->deleteRenderCache();
    }

    public function deleteEphemeral(EphemeralMedia $medium): void
    {
        $this->deletePath('local', $medium->path);
        $this->deletePath('local', $medium->thumbnail_path);
    }

    /** Derived private renders are regenerable and can include old watermarks. */
    public function deleteRenderCache(): void
    {
        $disk = Storage::disk('local');
        $directory = PhotoProcessingService::RENDER_CACHE_DIRECTORY;
        if ($disk->exists($directory) && ! $disk->deleteDirectory($directory)) {
            throw new RuntimeException('Le stockage a refusé la suppression des rendus privés.');
        }
    }
}
