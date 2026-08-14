<?php

namespace App\Console\Commands;

use App\Models\VerificationPhoto;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PruneVerificationPhotos extends Command
{
    protected $signature = 'privacy:prune-verification-photos {--days=30 : Retention period after a decision} {--dry-run : Report without deleting}';

    protected $description = 'Remove private verification selfies after the configured retention period';

    public function handle(): int
    {
        $cutoff = now()->subDays((int) $this->option('days'));
        $query = VerificationPhoto::whereIn('status', ['approved', 'rejected'])
            ->whereNotNull('path')
            ->where('updated_at', '<', $cutoff);

        $count = 0;
        $query->chunkById(100, function ($photos) use (&$count) {
            foreach ($photos as $photo) {
                $count++;

                if ($this->option('dry-run')) {
                    continue;
                }

                Storage::disk('local')->delete($photo->path);
                $photo->update(['path' => null]);
            }
        });

        $this->info("{$count} verification photo(s) eligible for deletion.");

        return Command::SUCCESS;
    }
}
