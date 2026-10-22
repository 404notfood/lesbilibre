<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\DB;

class Message extends Model
{
    /** @use HasFactory<\Database\Factories\MessageFactory> */
    use HasFactory;

    protected static function booted(): void
    {
        $record = fn (Message $message) => DB::table('message_changes')->insert(['message_id' => $message->id, 'conversation_id' => $message->conversation_id]);
        static::created($record);
        static::updated(function (Message $message) use ($record) {
            if ($message->wasChanged('moderation_status')) {
                $record($message);
            }
        });
    }

    public function publicContent(): string
    {
        return static::maskEmails($this->content);
    }

    public static function maskEmails(string $value): string
    {
        return preg_replace('/[A-Z0-9.!#$%&\x27*+\/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9.-]*[A-Z0-9])?\.[A-Z]{2,}/iu', '[adresse masquée]', $value) ?? '';
    }

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'read_at',
        'client_uuid',
        'moderation_status',
        'moderated_by',
        'reviewed_at',
        'moderation_reason',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    /**
     * Get the conversation that owns the message.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    /**
     * Get the sender of the message.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
