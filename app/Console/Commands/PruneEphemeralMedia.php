<?php

namespace App\Console\Commands;

use App\Models\EphemeralMedia;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PruneEphemeralMedia extends Command
{
    protected $signature = 'ephemeral:prune';

    protected $description = 'Supprime les fichiers éphémères arrivés au terme de leur rétention';

    /**
     * Delete the files, keep the rows.
     *
     * The row is what backs the aggregate counters shown in the admin console;
     * the file is what nobody should still be holding. Flagged media are left
     * alone: a report under review is the one case where the content must
     * remain available to a moderator.
     */
    public function handle(): int
    {
        $due = EphemeralMedia::stored()
            ->where('purge_after', '<=', now())
            ->where('is_flagged', false)
            ->get();

        $disk = Storage::disk('local');
        $removed = 0;

        foreach ($due as $medium) {
            foreach (array_filter([$medium->path, $medium->thumbnail_path]) as $path) {
                if ($disk->exists($path)) {
                    $disk->delete($path);
                }
            }

            $medium->update(['purged_at' => now()]);
            $removed++;
        }

        $held = EphemeralMedia::stored()
            ->where('purge_after', '<=', now())
            ->where('is_flagged', true)
            ->count();

        $this->info("{$removed} contenu(s) éphémère(s) supprimé(s).");

        if ($held > 0) {
            $this->warn("{$held} conservé(s) : signalement en cours.");
        }

        return self::SUCCESS;
    }
}
