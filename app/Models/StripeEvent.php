<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StripeEvent extends Model
{
    protected $fillable = [
        'stripe_event_id',
        'type',
        'payload',
        'processed',
        'processed_at',
        'error',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'processed' => 'boolean',
            'processed_at' => 'datetime',
        ];
    }

    /**
     * Mark event as processed.
     */
    public function markAsProcessed(): void
    {
        $this->update([
            'processed' => true,
            'processed_at' => now(),
            'error' => null,
        ]);
    }

    /**
     * Mark event as failed.
     */
    public function markAsFailed(string $error): void
    {
        $this->update([
            'processed' => false,
            'error' => $error,
        ]);
    }

    /**
     * Check if event has already been processed.
     */
    public function isProcessed(): bool
    {
        return $this->processed;
    }

    /**
     * Get or create event from Stripe event ID.
     */
    public static function findOrCreateFromStripeEvent(string $stripeEventId, string $type, array $payload): self
    {
        return self::firstOrCreate(
            ['stripe_event_id' => $stripeEventId],
            [
                'type' => $type,
                'payload' => $payload,
                'processed' => false,
            ]
        );
    }
}
