<?php

namespace App\Listeners;

use App\Events\MessageSent;
use App\Models\User;
use App\Services\WebPushService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendMessagePushNotification implements ShouldQueue
{
    public function __construct(private WebPushService $webPushService) {}

    public function handle(MessageSent $event): void
    {
        $conversation = $event->message->conversation;
        $senderId = $event->message->sender_id;

        $recipientId = $conversation->user1_id === $senderId
            ? $conversation->user2_id
            : $conversation->user1_id;

        $recipient = User::find($recipientId);

        if (! $recipient) {
            return;
        }

        $senderName = $event->message->sender->name;
        $preview = mb_substr($event->message->content, 0, 50);

        $this->webPushService->sendToUser($recipient, [
            'title' => "Message de {$senderName}",
            'body' => $preview,
            'url' => "/conversations/{$conversation->id}",
            'tag' => 'message-conversation-'.$conversation->id,
        ]);
    }
}
