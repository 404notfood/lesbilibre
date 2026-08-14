<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Services\TrustScoreService;
use Illuminate\Console\Command;

class RefreshTrustScores extends Command
{
    protected $signature = 'trust:refresh {--user= : Refresh only a specific user ID}';

    protected $description = 'Recalculate trust scores for all active users';

    public function handle(TrustScoreService $trustScoreService): int
    {
        $userId = $this->option('user');

        if ($userId) {
            $user = User::find($userId);

            if (! $user) {
                $this->error("User {$userId} not found.");

                return self::FAILURE;
            }

            $trustScoreService->refreshScore($user);
            $this->info("Trust score refreshed for user {$user->name}: {$user->trust_score}");

            return self::SUCCESS;
        }

        $count = 0;
        $bar = $this->output->createProgressBar(User::where('is_banned', false)->count());

        User::where('is_banned', false)
            ->with(['profile', 'photos', 'reportsReceived', 'badges'])
            ->chunk(100, function ($users) use ($trustScoreService, &$count, $bar) {
                foreach ($users as $user) {
                    $trustScoreService->refreshScore($user);
                    $count++;
                    $bar->advance();
                }
            });

        $bar->finish();
        $this->newLine();
        $this->info("Trust scores refreshed for {$count} users.");

        return self::SUCCESS;
    }
}
