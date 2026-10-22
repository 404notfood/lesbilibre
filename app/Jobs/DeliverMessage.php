<?php

namespace App\Jobs;

use App\Events\MessageSent;
use App\Models\MessageDelivery;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class DeliverMessage implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public int $timeout = 30;

    public array $backoff = [10, 30, 120, 300];

    public function __construct(public int $deliveryId) {}

    public function handle(): void
    {
        try {
            DB::transaction(function () {
                $delivery = MessageDelivery::lockForUpdate()->find($this->deliveryId);
                if (! $delivery || $delivery->state !== 'pending') {
                    return;
                }

                $message = $delivery->message()->with(['sender', 'conversation.user1', 'conversation.user2'])->first();
                if ($message && $message->moderation_status === 'pending') {
                    return;
                }
                $conversation = $message?->conversation;
                // A queued event must never outlive a block, suspension or erasure.
                if (! $message?->sender || $message->moderation_status !== 'approved' || ! $conversation?->user1 || ! $conversation->user2 || ! $conversation->user1->canInteractWith($conversation->user2)) {
                    $delivery->update(['state' => 'cancelled', 'last_attempt_at' => now()]);

                    return;
                }

                // Synchronous broadcasting is now isolated in a durable retryable job.
                // Clients deduplicate by message id if a worker dies after emission.
                event(new MessageSent($message));
                $delivery->update(['state' => 'delivered', 'attempts' => $delivery->attempts + 1, 'last_attempt_at' => now(), 'delivered_at' => now(), 'next_attempt_at' => null]);
            }, attempts: 3);
        } catch (\Throwable $exception) {
            MessageDelivery::whereKey($this->deliveryId)->where('state', 'pending')->update([
                'attempts' => DB::raw('attempts + 1'),
                'last_attempt_at' => now(),
                'next_attempt_at' => now()->addMinutes(2),
            ]);
            throw $exception;
        }
    }
}
