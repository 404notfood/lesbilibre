<?php

namespace App\Console\Commands;

use App\Models\PremiumPlan;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PrepareLaunchCatalog extends Command
{
    protected $signature = 'billing:prepare-launch-catalog {--activate : Offer these plans and retire previous offers without changing existing subscriptions}';

    protected $description = 'Prepare the 9.90 EUR monthly and 24.90 EUR quarterly launch offers using new Stripe price identifiers';

    public function handle(): int
    {
        DB::transaction(function () {
            $ids = [];
            foreach (config('launch-pricing.plans') as $slug => $definition) {
                $plan = PremiumPlan::firstOrCreate(['slug' => $slug], $definition + ['is_active' => false]);
                // Never silently change a price that may already be sold by Stripe.
                if ((float) $plan->price !== $definition['price'] || $plan->duration_months !== $definition['duration_months']) {
                    throw new RuntimeException('Une offre de lancement existe avec un autre montant : examinez le catalogue avant de continuer.');
                }
                $ids[] = $plan->id;
            }
            if ($this->option('activate')) {
                PremiumPlan::whereNotIn('id', $ids)->update(['is_active' => false]);
                PremiumPlan::whereIn('id', $ids)->update(['is_active' => true]);
            }
        });
        $this->info($this->option('activate') ? 'Offres de lancement affichées. Abonnements existants conservés.' : 'Offres préparées en brouillon. Utiliser --activate pour les afficher.');
        $this->comment('Sans nouveaux identifiants de prix Stripe configurés, le paiement reste indisponible. Ne pas réutiliser les identifiants des anciens montants.');

        return self::SUCCESS;
    }
}
