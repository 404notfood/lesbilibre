<?php

namespace App\Listeners;

use App\Enums\NotificationFrequency;
use App\Enums\NotificationType;
use App\Events\MessageSent;
use App\Models\Message;
use App\Services\WebPushService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendMessagePushNotification implements ShouldQueue
{
    public bool $afterCommit = true;

    public function __construct(private WebPushService $webPushService) {}

    public function handle(MessageSent $event): void
    {
        $message = Message::with(['conversation.user1', 'conversation.user2', 'sender'])->find($event->message->id);
        $conversation = $message?->conversation;
        if (! $conversation || ! $message->sender || $message->moderation_status !== 'approved') {
            return;
        }
        $recipient = $conversation->user1_id === $message->sender_id ? $conversation->user2 : $conversation->user1;
        if (! $recipient || ! $recipient->canInteractWith($message->sender) || ! $recipient->wantsNotification(NotificationType::NewMessage, NotificationFrequency::Immediate)) {
            return;
        }
        $showPseudo = config('webpush.show_sender_pseudo', false);
        $pseudo = $message->sender->pseudo ?: 'une personne';
        $this->webPushService->sendToUser($recipient, [
            'title' => $showPseudo ? "Message de {$pseudo}" : 'LesbiLibre',
            'body' => 'Tu as reçu un nouveau message.',
            'url' => '/conversations/'.$conversation->id,
            'tag' => 'message-conversation-'.$conversation->id,
        ]);
    }
}
