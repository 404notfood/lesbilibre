<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\TrustScoreService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class RefreshTrustScore implements ShouldQueue
{
    use InteractsWithQueue;

    public function __construct(protected TrustScoreService $trustScoreService) {}

    public function handle(object $event): void
    {
        $user = $this->getUserFromEvent($event);

        if ($user) {
            $this->trustScoreService->refreshScore($user);
        }
    }

    protected function getUserFromEvent(object $event): ?User
    {
        if (isset($event->user) && $event->user instanceof User) {
            return $event->user;
        }

        if (isset($event->like)) {
            return $event->like->likedUser ?? null;
        }

        if (isset($event->userMatch)) {
            return User::find($event->recipientUserId ?? null);
        }

        if (isset($event->photo)) {
            return $event->photo->user ?? null;
        }

        return null;
    }
}
