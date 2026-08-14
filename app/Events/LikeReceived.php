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
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id' => $this->like->id,
            'type' => 'like',
            'message' => $this->like->user->name.' a liké votre profil',
            'user' => [
                'id' => $this->like->user->id,
                'name' => $this->like->user->name,
                'photo' => $this->like->user->photos->where('is_primary', true)->first()?->path
                    ? asset('storage/'.$this->like->user->photos->where('is_primary', true)->first()->path)
                    : null,
            ],
            'created_at' => $this->like->created_at->toISOString(),
        ];
    }
}
