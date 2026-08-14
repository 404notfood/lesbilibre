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
        $plans = [
            [
                'slug' => '1-month',
                'name' => '1 mois',
                'tagline' => 'Pour essayer sans engagement',
                'duration_months' => 1,
                'price' => 19.99,
                'stripe_price_id' => config('services.stripe.price_1_month'),
                'perks' => [
                    'Likes illimités',
                    'Voir qui vous a likée',
                    'Filtres de recherche avancés',
                    'Mode incognito',
                    'Messages prioritaires',
                ],
                'entitlements' => [
                    'unlimited_likes' => true,
                    'first_messages_per_day' => 0,
                    'see_who_liked' => true,
                    'advanced_filters' => true,
                    'incognito' => true,
                    'priority_messages' => true,
                ],
                'gems_on_signup' => 0,
                'gems_per_month' => 0,
                'is_featured' => false,
                'display_order' => 1,
            ],
            [
                'slug' => '3-months',
                'name' => '3 mois',
                'tagline' => 'Le meilleur rapport qualité-prix',
                'duration_months' => 3,
                'price' => 44.99,
                'stripe_price_id' => config('services.stripe.price_3_months'),
                'perks' => [
                    'Likes illimités',
                    'Voir qui vous a likée',
                    'Filtres de recherche avancés',
                    'Mode incognito',
                    'Messages prioritaires',
                ],
                'entitlements' => [
                    'unlimited_likes' => true,
                    'first_messages_per_day' => 0,
                    'see_who_liked' => true,
                    'advanced_filters' => true,
                    'incognito' => true,
                    'priority_messages' => true,
                ],
                'gems_on_signup' => 0,
                'gems_per_month' => 0,
                'is_featured' => true,
                'display_order' => 2,
            ],
            [
                'slug' => '6-months',
                'name' => '6 mois',
                'tagline' => 'L’engagement le plus avantageux',
                'duration_months' => 6,
                'price' => 69.99,
                'stripe_price_id' => config('services.stripe.price_6_months'),
                'perks' => [
                    'Likes illimités',
                    'Voir qui vous a likée',
                    'Filtres de recherche avancés',
                    'Mode incognito',
                    'Messages prioritaires',
                ],
                'entitlements' => [
                    'unlimited_likes' => true,
                    'first_messages_per_day' => 0,
                    'see_who_liked' => true,
                    'advanced_filters' => true,
                    'incognito' => true,
                    'priority_messages' => true,
                ],
                'gems_on_signup' => 0,
                'gems_per_month' => 0,
                'is_featured' => false,
                'display_order' => 3,
            ],
        ];

        foreach ($plans as $plan) {
            PremiumPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
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
