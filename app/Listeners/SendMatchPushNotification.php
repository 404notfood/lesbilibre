<?php

namespace App\Listeners;

use App\Enums\NotificationFrequency;
use App\Enums\NotificationType;
use App\Events\MatchCreated;
use App\Models\User;
use App\Models\UserMatch;
use App\Services\WebPushService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendMatchPushNotification implements ShouldQueue
{
    public bool $afterCommit = true;

    public function __construct(private WebPushService $webPushService) {}

    public function handle(MatchCreated $event): void
    {
        $match = UserMatch::find($event->userMatch->id);
        $recipient = User::find($event->recipientUserId);
        if (! $match || ! $recipient || ! in_array($recipient->id, [$match->user1_id, $match->user2_id], true)) {
            return;
        }
        $other = $recipient->id === $match->user1_id ? $match->user2 : $match->user1;
        if (! $other || ! $recipient->canInteractWith($other) || ! $recipient->wantsNotification(NotificationType::MatchCreated, NotificationFrequency::Immediate)) {
            return;
        }
        $this->webPushService->sendToUser($recipient, [
            'title' => 'LesbiLibre',
            'body' => config('webpush.show_sender_pseudo') ? 'Tu as un match avec '.($other->pseudo ?: 'une personne').'.' : 'Tu as un nouveau match.',
            'url' => '/matches',
            'tag' => 'match-'.$match->id,
        ]);
    }
}
