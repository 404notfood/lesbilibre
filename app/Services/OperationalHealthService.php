<?php

namespace App\Services;

use App\Models\EphemeralMedia;
use App\Models\Photo;
use App\Models\Report;
use App\Models\VerificationPhoto;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class OperationalHealthService
{
    public function record(string $task, string $state): void
    {
        $key = 'operations:task:'.$task;
        $record = Cache::get($key, []);
        $record['state'] = $state;
        $record[$state.'_at'] = now()->toIso8601String();
        Cache::forever($key, $record);
    }

    public function snapshot(): array
    {
        $tasks = [];
        foreach (config('operations.tasks') as $task => $definition) {
            $record = Cache::get('operations:task:'.$task, []);
            $lastSuccess = $record['success_at'] ?? null;
            $state = $record['state'] ?? 'unknown';
            if ($state !== 'failed' && (! $lastSuccess || Carbon::parse($lastSuccess)->lt(now()->subMinutes($definition['max_age_minutes'])))) {
                $state = $lastSuccess ? 'late' : 'unknown';
            }
            $tasks[] = ['name' => $task, 'label' => $definition['label'], 'state' => $state, 'last_success_at' => $lastSuccess, 'last_failure_at' => $record['failed_at'] ?? null];
        }

        $cutoff = now()->subHours(config('operations.moderation_warning_hours'));
        $backlogs = [
            'photos' => Photo::whereHas('user')->whereIn('moderation_status', ['pending', 'quarantined'])->where('created_at', '<', $cutoff)->count(),
            'verifications' => VerificationPhoto::whereHas('user')->where('status', 'pending')->where('created_at', '<', $cutoff)->count(),
            'reports' => Report::where('status', 'pending')->where('created_at', '<', $cutoff)->count(),
            'videos_pending' => EphemeralMedia::where('processing_status', 'pending')->whereNull('purged_at')->where('created_at', '<', now()->subMinutes(config('operations.video_warning_minutes')))->count(),
            'videos_failed' => EphemeralMedia::where('processing_status', 'failed')->whereNull('purged_at')->count(),
            // A flagged file is intentionally retained for human review.
            'purges_due' => EphemeralMedia::whereNull('purged_at')->where('is_flagged', false)->where('purge_after', '<', now()->subDay())->count(),
            'failed_jobs' => Schema::hasTable('failed_jobs') ? DB::table('failed_jobs')->count() : 0,
            'account_erasures_pending' => Schema::hasTable('account_erasures') ? DB::table('account_erasures')->where('status', '!=', 'completed')->count() : 0,
            'messages' => \App\Models\Message::where('moderation_status', 'pending')->where('created_at', '<', $cutoff)->count(),
            'media_pending' => EphemeralMedia::where('moderation_status', 'pending')->whereNull('purged_at')->where('created_at', '<', $cutoff)->count(),
            'deliveries_pending' => Schema::hasTable('message_deliveries') ? DB::table('message_deliveries')->join('messages', 'messages.id', '=', 'message_deliveries.message_id')->where('message_deliveries.state', 'pending')->where('messages.moderation_status', 'approved')->where('message_deliveries.created_at', '<', now()->subMinutes(5))->count() : 0,
        ];

        return [
            'tasks' => $tasks,
            'backlogs' => $backlogs,
            'moderation_warning_hours' => config('operations.moderation_warning_hours'),
            'video_warning_minutes' => config('operations.video_warning_minutes'),
            'needs_attention' => collect($tasks)->contains(fn ($task) => ! in_array($task['state'], ['success', 'started'])) || array_sum($backlogs) > 0,
        ];
    }
}
