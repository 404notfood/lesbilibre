<?php

namespace App\Console\Commands;

use App\Jobs\DeliverMessage;
use App\Models\MessageDelivery;
use Illuminate\Console\Command;

class RetryMessageDelivery extends Command
{
    protected $signature = 'messages:retry-delivery';

    protected $description = 'Requeue pending message deliveries, including when the queue broker was unavailable';

    public function handle(): int
    {
        $failed = false;
        MessageDelivery::where('state', 'pending')
            ->whereHas('message', fn ($query) => $query->where('moderation_status', 'approved'))
            ->where(fn ($query) => $query->whereNull('next_attempt_at')->orWhere('next_attempt_at', '<=', now()))
            ->orderBy('id')->limit(100)->get()->each(function (MessageDelivery $delivery) use (&$failed) {
                // Avoid scheduling the same stalled work every minute; a worker
                // failure is still recoverable after this lease expires.
                $delivery->update(['next_attempt_at' => now()->addMinutes(5)]);
                try {
                    DeliverMessage::dispatch($delivery->id);
                } catch (\Throwable) {
                    $failed = true;
                }
            });

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
