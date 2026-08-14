<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    /** @use HasFactory<\Database\Factories\ConversationFactory> */
    use HasFactory;

    protected $fillable = [
        'user1_id',
        'user2_id',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    /**
     * Get the first user in the conversation.
     */
    public function user1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user1_id');
    }

    /**
     * Get the second user in the conversation.
     */
    public function user2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user2_id');
    }

    /**
     * Get all messages in the conversation.
     */
    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Determine whether the conversation is still awaiting a first reply from
     * the recipient of the opening message.
     */
    public function isAwaitingFirstReply(): bool
    {
        $senderIds = $this->messages()->distinct()->pluck('sender_id');

        return $senderIds->count() === 1;
    }

    /**
     * Determine whether the given user may send a message right now.
     *
     * Before a match, the opener gets a single introduction message and must
     * wait for a reply. Matched users may exchange messages freely.
     */
    public function canSendMessage(User $user): bool
    {
        if ($this->isMatched()) {
            return true;
        }

        $senderIds = $this->messages()->distinct()->pluck('sender_id');

        if ($senderIds->isEmpty()) {
            return true;
        }

        return ! ($senderIds->count() === 1 && $senderIds->first() === $user->id);
    }

    /**
     * Determine whether both participants have matched.
     */
    public function isMatched(): bool
    {
        return UserMatch::where(function ($query) {
            $query->where('user1_id', $this->user1_id)
                ->where('user2_id', $this->user2_id);
        })->orWhere(function ($query) {
            $query->where('user1_id', $this->user2_id)
                ->where('user2_id', $this->user1_id);
        })->exists();
    }
}
