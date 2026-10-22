<?php

namespace App\Console\Commands;

use App\Services\OperationalHealthService;
use Illuminate\Console\Command;

class OperationsStatus extends Command
{
    protected $signature = 'operations:status {--json : Machine-readable status, without personal data}';

    protected $description = 'Inspect scheduled task heartbeats, moderation delays and video failures';

    public function handle(OperationalHealthService $health): int
    {
        $snapshot = $health->snapshot();
        if ($this->option('json')) {
            $this->line(json_encode($snapshot, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE));
        } else {
            $this->table(['Tâche', 'État', 'Dernier succès'], array_map(fn ($task) => [$task['label'], $task['state'], $task['last_success_at'] ?? 'Non observé'], $snapshot['tasks']));
            $this->table(['File', 'À examiner'], collect($snapshot['backlogs'])->map(fn ($count, $name) => [$name, $count])->values()->all());
            $this->comment('Un état inconnu demande une vérification ; il ne prouve pas une panne. Utiliser un cache persistant partagé avec le planificateur.');
        }

        return $snapshot['needs_attention'] ? self::FAILURE : self::SUCCESS;
    }
}
