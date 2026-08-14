<?php

namespace App\Events;

use App\Models\UserMatch;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MatchCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public UserMatch $userMatch, public int $recipientUserId) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.'.$this->recipientUserId),
        ];
    }

    /**
     * The event name broadcast to clients.
     */
    public function broadcastAs(): string
    {
        return 'MatchCreated';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $otherUser = $this->recipientUserId === $this->userMatch->user1_id
            ? $this->userMatch->user2
            : $this->userMatch->user1;

        return [
            'id' => $this->userMatch->id,
            'type' => 'match',
            'message' => 'Vous avez un nouveau match avec '.$otherUser->name,
            'user' => [
                'id' => $otherUser->id,
                'name' => $otherUser->name,
                'photo' => $otherUser->photos->where('is_primary', true)->first()?->path
                    ? asset('storage/'.$otherUser->photos->where('is_primary', true)->first()->path)
                    : null,
            ],
            'created_at' => $this->userMatch->created_at->toISOString(),
        ];
    }
}
