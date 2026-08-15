<?php

namespace App\Console\Commands;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Console\Command;

/**
 * Bascule en « expired » les abonnements dont la date de fin est passée et
 * retire le premium aux membres qui n'ont plus aucun abonnement valide.
 *
 * Les abonnements Stripe sont normalement clôturés par les webhooks, mais
 * ceux créés depuis la console admin (payment_method = admin) n'ont aucun
 * cycle de facturation derrière eux : sans ce passage quotidien, ils
 * resteraient actifs indéfiniment.
 */
class ExpireSubscriptions extends Command
{
    protected $signature = 'subscriptions:expire {--dry-run : Affiche ce qui serait fait sans rien modifier}';

    protected $description = 'Expire les abonnements arrivés à échéance et retire le premium associé';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $expired = Subscription::query()
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->get();

        if ($expired->isEmpty()) {
            $this->info('Aucun abonnement arrivé à échéance.');
        } else {
            $this->info("{$expired->count()} abonnement(s) arrivé(s) à échéance.");

            foreach ($expired as $subscription) {
                $this->line(sprintf(
                    '  #%d — %s — expiré le %s',
                    $subscription->id,
                    $subscription->user?->email ?? 'utilisatrice supprimée',
                    $subscription->expires_at->format('d/m/Y'),
                ));
            }

            if (! $dryRun) {
                Subscription::query()
                    ->whereIn('id', $expired->pluck('id'))
                    ->update(['status' => 'expired']);
            }
        }

        // Membres marqués premium sans aucun abonnement actif restant.
        // premium_expires_at à null = premium illimité accordé à la main :
        // on n'y touche pas, seule une action admin peut le retirer.
        $staleUsers = User::query()
            ->where('is_premium', true)
            ->whereNotNull('premium_expires_at')
            ->where('premium_expires_at', '<=', now())
            ->whereDoesntHave('subscriptions', function ($query) {
                $query->where('status', 'active')
                    ->where(function ($inner) {
                        $inner->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    });
            })
            ->get();

        if ($staleUsers->isEmpty()) {
            $this->info('Aucun premium à retirer.');
        } else {
            $this->info("{$staleUsers->count()} premium à retirer.");

            foreach ($staleUsers as $user) {
                $this->line("  {$user->email}");
            }

            if (! $dryRun) {
                User::query()
                    ->whereIn('id', $staleUsers->pluck('id'))
                    ->update([
                        'is_premium' => false,
                        'premium_expires_at' => null,
                    ]);
            }
        }

        if ($dryRun) {
            $this->comment('Mode simulation : aucune modification enregistrée.');
        }

        return Command::SUCCESS;
    }
}
