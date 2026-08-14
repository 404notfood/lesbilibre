<?php

namespace App\Listeners;

use App\Events\LikeReceived;
use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendLikePushNotification implements ShouldQueue
{
    public function __construct(private WebPushService $webPushService) {}

    public function handle(LikeReceived $event): void
    {
        $likedUser = User::find($event->like->liked_user_id);

        if (! $likedUser) {
            return;
        }

        $likerName = $event->like->user->name;

        $this->webPushService->sendToUser($likedUser, [
            'title' => 'Nouveau like !',
            'body' => "{$likerName} a aime ton profil",
            'url' => '/likes/received',
            'tag' => 'like-'.$event->like->id,
        ]);
    }
}
