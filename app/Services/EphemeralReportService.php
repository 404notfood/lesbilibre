<?php

namespace App\Services;

use App\Models\EphemeralMedia;
use App\Models\Report;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class EphemeralReportService
{
    public const OPEN_STATUSES = ['pending', 'reviewed'];

    public function report(EphemeralMedia $medium, User $reporter, string $reason): Report
    {
        return DB::transaction(function () use ($medium, $reporter, $reason) {
            $current = EphemeralMedia::query()->lockForUpdate()->findOrFail($medium->id);
            abort_unless($current->recipient_id === $reporter->id, 403);
            abort_if($current->purged_at !== null, 410, 'Ce contenu a déjà été supprimé.');

            $report = Report::where('ephemeral_media_id', $current->id)
                ->where('reporter_id', $reporter->id)
                ->whereIn('status', self::OPEN_STATUSES)
                ->first();

            if ($report === null) {
                $report = Report::create([
                    'reporter_id' => $reporter->id,
                    'reported_user_id' => $current->sender_id,
                    'ephemeral_media_id' => $current->id,
                    'reason' => 'inappropriate_content',
                    'description' => $reason,
                    'status' => 'pending',
                ]);
            }

            // A repeat report does not postpone retention indefinitely.
            $current->update(['is_flagged' => true]);

            return $report;
        });
    }

    public function updateReport(Report $report, string $status, ?string $notes): Report
    {
        return DB::transaction(function () use ($report, $status, $notes) {
            // All decisions lock the medium before its reports, including the
            // bulk actions from the media console.
            $medium = $report->ephemeral_media_id
                ? EphemeralMedia::query()->lockForUpdate()->find($report->ephemeral_media_id)
                : null;
            $current = Report::query()->lockForUpdate()->findOrFail($report->id);
            $current->update(['status' => $status, 'admin_notes' => $notes]);

            if ($medium !== null) {
                $this->syncFlag($medium);
            }

            return $current;
        });
    }

    public function resolveMedia(EphemeralMedia $medium, string $status, ?string $notes = null): void
    {
        DB::transaction(function () use ($medium, $status, $notes) {
            $current = EphemeralMedia::query()->lockForUpdate()->findOrFail($medium->id);
            $reports = Report::where('ephemeral_media_id', $current->id)
                ->whereIn('status', self::OPEN_STATUSES)->lockForUpdate()->get();
            foreach ($reports as $report) {
                $report->update(['status' => $status, 'admin_notes' => $notes]);
            }
            $this->syncFlag($current);
        });
    }

    private function syncFlag(EphemeralMedia $medium): void
    {
        $medium->update(['is_flagged' => $medium->purged_at === null
            && Report::where('ephemeral_media_id', $medium->id)->whereIn('status', self::OPEN_STATUSES)->exists()]);
    }
}
