<?php

namespace App\Listeners;

use App\Enums\NotificationFrequency;
use App\Enums\NotificationType;
use App\Events\LikeReceived;
use App\Models\Like;
use App\Services\WebPushService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendLikePushNotification implements ShouldQueue
{
    public bool $afterCommit = true;

    public function __construct(private WebPushService $webPushService) {}

    public function handle(LikeReceived $event): void
    {
        $like = Like::with(['user', 'likedUser'])->find($event->like->id);
        $recipient = $like?->likedUser;
        $sender = $like?->user;
        if (! $recipient || ! $sender || ! $recipient->canInteractWith($sender) || ! $recipient->wantsNotification(NotificationType::LikeReceived, NotificationFrequency::Immediate)) {
            return;
        }
        $this->webPushService->sendToUser($recipient, [
            'title' => 'LesbiLibre',
            'body' => config('webpush.show_sender_pseudo') ? ($sender->pseudo ?: 'Une personne').' a aimé ton profil.' : 'Tu as reçu un nouveau like.',
            'url' => '/likes/received',
            'tag' => 'like-'.$like->id,
        ]);
    }
}
