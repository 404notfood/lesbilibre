<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Message $message) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastWhen(): bool
    {
        return $this->mayBroadcast();
    }

    public function broadcastOn(): array
    {
        if (! $this->mayBroadcast()) {
            return [];
        }

        return [
            new PrivateChannel('conversation.'.$this->message->conversation_id),
        ];
    }

    /**
     * The event name broadcast to clients.
     */
    public function broadcastAs(): string
    {
        return 'MessageSent';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->message->id,
            'conversation_id' => $this->message->conversation_id,
            'sender_id' => $this->message->sender_id,
            'content' => $this->message->publicContent(),
            'moderation_status' => 'approved',
            'created_at' => $this->message->created_at->toISOString(),
            'sender' => [
                'id' => $this->message->sender->id,
                'name' => $this->message->sender->pseudo,
            ],
        ];
    }

    private function mayBroadcast(): bool
    {
        $conversation = $this->message->conversation()->with(['user1.profile', 'user2.profile'])->first();

        return $this->message->fresh()?->moderation_status === 'approved' && $conversation?->user1 && $conversation->user2 && $conversation->user1->canInteractWith($conversation->user2);
    }
}
