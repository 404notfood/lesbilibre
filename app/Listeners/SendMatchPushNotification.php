<?php

namespace App\Listeners;

use App\Events\MatchCreated;
use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendMatchPushNotification implements ShouldQueue
{
    public function __construct(private WebPushService $webPushService) {}

    public function handle(MatchCreated $event): void
    {
        $recipientUser = User::find($event->recipientUserId);

        if (! $recipientUser) {
            return;
        }

        $otherUser = $event->recipientUserId === $event->userMatch->user1_id
            ? $event->userMatch->user2
            : $event->userMatch->user1;

        $this->webPushService->sendToUser($recipientUser, [
            'title' => 'Nouveau match !',
            'body' => "Tu as matche avec {$otherUser->name} !",
            'url' => '/matches',
            'tag' => 'match-'.$event->userMatch->id,
        ]);
    }
}
