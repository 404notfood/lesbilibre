<?php

namespace App\Models;

use App\Jobs\DeliverMessage;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Log;

class MessageDelivery extends Model
{
    protected $attributes = ['state' => 'pending', 'attempts' => 0];

    protected $fillable = ['message_id', 'state', 'attempts', 'last_attempt_at', 'next_attempt_at', 'delivered_at'];

    protected function casts(): array
    {
        return ['last_attempt_at' => 'datetime', 'next_attempt_at' => 'datetime', 'delivered_at' => 'datetime'];
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    /** Call after the approval transaction commits; the outbox survives queue outages. */
    public static function enqueueApproved(Message $message): void
    {
        if ($message->moderation_status !== 'approved') {
            return;
        }
        $delivery = static::firstOrCreate(['message_id' => $message->id], ['next_attempt_at' => now()->addMinutes(2)]);
        if ($delivery->state !== 'pending') {
            return;
        }
        try {
            DeliverMessage::dispatch($delivery->id);
        } catch (\Throwable) {
            Log::warning('Approved message saved; delivery pending retry.', ['delivery_id' => $delivery->id]);
        }
    }
}
