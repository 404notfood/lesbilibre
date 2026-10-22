<?php

namespace App\Console\Commands;

use App\Models\AccountErasure;
use App\Models\User;
use App\Services\AccountErasureService;
use Illuminate\Console\Command;
use Throwable;

class RetryAccountErasures extends Command
{
    protected $signature = 'privacy:retry-erasure {--id= : Retry one request, including one with exhausted automatic attempts}';

    protected $description = 'Retry pending account erasures without exposing personal data or storage paths';

    public function handle(AccountErasureService $erasures): int
    {
        $failed = 0;
        AccountErasure::where('billing_pending', true)->whereNull('approved_at')
            ->where(fn ($query) => $query->whereNull('last_attempt_at')->orWhere('last_attempt_at', '<', now()->subMinutes(5)))
            ->chunkById(50, function ($requests) use ($erasures, &$failed) {
                foreach ($requests as $request) {
                    if ($subject = User::withTrashed()->find($request->user_id)) {
                        $erasures->retryClosureBilling($subject);
                        if ($request->fresh()->billing_pending) {
                            $failed++;
                        }
                    }
                }
            });
        AccountErasure::whereNotNull('approved_at')->whereNotNull('approved_by')->whereIn('status', ['pending', 'failed', 'processing'])
            ->when($this->option('id'), fn ($query, $id) => $query->whereKey($id), fn ($query) => $query->where('attempts', '<', 5))
            ->where(fn ($query) => $query->whereNull('last_attempt_at')->orWhere('last_attempt_at', '<', now()->subMinutes(5)))
            ->chunkById(50, function ($requests) use ($erasures, &$failed) {
                foreach ($requests as $request) {
                    if (! $subject = User::withTrashed()->find($request->user_id)) {
                        $failed++;

                        continue;
                    }
                    try {
                        $erasures->erase($subject, User::find($request->approved_by));
                    } catch (Throwable $exception) {
                        $failed++;
                    }
                }
            });
        $this->info($failed === 0 ? 'Reprises terminées.' : "{$failed} demande(s) restent à examiner.");

        return $failed ? self::FAILURE : self::SUCCESS;
    }
}
