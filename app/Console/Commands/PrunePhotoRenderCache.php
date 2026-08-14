<?php

namespace App\Console\Commands;

use App\Services\PhotoProcessingService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PrunePhotoRenderCache extends Command
{
    protected $signature = 'photos:prune-render-cache';

    protected $description = 'Supprime les rendus de photos expirés du disque privé';

    /**
     * Rendered photos are personalised with a viewer's pseudo and pile up on
     * disk. Nothing reads them past their TTL, so they are dead weight — and
     * dead weight that carries somebody's identity.
     */
    public function handle(): int
    {
        $disk = Storage::disk('local');
        $directory = PhotoProcessingService::RENDER_CACHE_DIRECTORY;

        if (! $disk->exists($directory)) {
            $this->info('Aucun cache de rendu à purger.');

            return self::SUCCESS;
        }

        $expiresBefore = now()->subSeconds(PhotoProcessingService::RENDER_CACHE_TTL)->getTimestamp();
        $removed = 0;

        foreach ($disk->files($directory) as $file) {
            if ($disk->lastModified($file) <= $expiresBefore) {
                $disk->delete($file);
                $removed++;
            }
        }

        $this->info("{$removed} rendu(s) supprimé(s).");

        return self::SUCCESS;
    }
}
