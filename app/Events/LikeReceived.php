<?php

namespace App\Events;

use App\Models\Like;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LikeReceived implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public Like $like) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.'.$this->like->liked_user_id),
        ];
    }

    /**
     * The event name broadcast to clients.
     */
    public function broadcastAs(): string
    {
        return 'LikeReceived';
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->like->id,
            'type' => 'like',
            'message' => $this->like->user->pseudo.' a liké votre profil',
            'user' => [
                'id' => $this->like->user->id,
                'name' => $this->like->user->pseudo,
                'photo' => $this->like->user->avatarPhoto?->viewUrl(thumbnail: true),
            ],
            'created_at' => $this->like->created_at->toISOString(),
        ];
    }
}
