<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\BadgeService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

class CheckUserBadges implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Create the event listener.
     */
    public function __construct(protected BadgeService $badgeService) {}

    /**
     * Handle the event.
     */
    public function handle(object $event): void
    {
        $user = $this->getUserFromEvent($event);

        if ($user) {
            $this->badgeService->checkAndAwardBadges($user);
        }
    }

    /**
     * Extract user from various event types.
     */
    protected function getUserFromEvent(object $event): ?User
    {
        // Handle different event structures
        if (isset($event->user) && $event->user instanceof User) {
            return $event->user;
        }

        if (isset($event->model) && $event->model instanceof User) {
            return $event->model;
        }

        // For like events
        if (isset($event->like)) {
            return $event->like->user ?? null;
        }

        // For match events
        if (isset($event->userMatch)) {
            // Return the recipient user
            return User::find($event->recipientUserId ?? null);
        }

        // For message events
        if (isset($event->message)) {
            return $event->message->sender ?? null;
        }

        // For photo events
        if (isset($event->photo)) {
            return $event->photo->user ?? null;
        }

        return null;
    }
}
