<?php

namespace Database\Seeders;

use App\Models\GemPackage;
use App\Models\PremiumPlan;
use Illuminate\Database\Seeder;

class BillingSeeder extends Seeder
{
    /**
     * Seed the catalogue that used to be hardcoded across PremiumController,
     * ShopController and PaymentService. Uses updateOrCreate so running the
     * seeder again never duplicates a plan nor overwrites admin edits to
     * columns that are not listed here.
     */
    public function run(): void
    {
        // New installations use the launch catalogue. Existing admin edits and
        // historical Stripe prices are preserved on subsequent seeding.
        foreach (config('launch-pricing.plans') as $slug => $plan) {
            PremiumPlan::firstOrCreate(['slug' => $slug], $plan + ['is_active' => true]);
        }

        $packages = [
            ['name' => 'Découverte', 'amount' => 100, 'bonus' => 0, 'price' => 4.99, 'is_featured' => false, 'display_order' => 1],
            ['name' => 'Petite réserve', 'amount' => 250, 'bonus' => 25, 'price' => 9.99, 'is_featured' => false, 'display_order' => 2],
            ['name' => 'Populaire', 'amount' => 500, 'bonus' => 75, 'price' => 19.99, 'is_featured' => true, 'display_order' => 3],
            ['name' => 'Généreuse', 'amount' => 1000, 'bonus' => 200, 'price' => 34.99, 'is_featured' => false, 'display_order' => 4],
            ['name' => 'Coffre', 'amount' => 2500, 'bonus' => 600, 'price' => 79.99, 'is_featured' => false, 'display_order' => 5],
        ];

        foreach ($packages as $package) {
            GemPackage::updateOrCreate(
                ['amount' => $package['amount']],
                $package
            );
        }
    }
}
