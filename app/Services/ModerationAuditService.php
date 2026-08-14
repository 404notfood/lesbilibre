<?php

namespace App\Services;

use App\Models\ModerationAction;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ModerationAuditService
{
    public function record(
        User $moderator,
        Model $subject,
        string $action,
        ?User $subjectUser = null,
        ?string $reason = null,
        ?string $notes = null,
        ?array $metadata = null,
    ): ModerationAction {
        return ModerationAction::create([
            'moderator_id' => $moderator->id,
            'subject_user_id' => $subjectUser?->id,
            'subject_type' => $subject::class,
            'subject_id' => $subject->getKey(),
            'action' => $action,
            'reason' => $reason,
            'notes' => $notes,
            'metadata' => $metadata,
        ]);
    }
}
