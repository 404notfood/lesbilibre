<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class GrantPremiumMonthlyGems extends Command
{
    protected $signature = 'premium:grant-monthly-gems';

    protected $description = 'Deprecated: Premium gems are credited from Stripe invoice webhooks';

    public function handle(): int
    {
        $this->warn('No gems were granted. Premium bonuses are credited only from invoice.payment_succeeded Stripe webhooks.');

        return Command::FAILURE;
    }
}
