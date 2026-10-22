<?php

$perks = ['Likes illimités', 'Voir qui vous a likée', 'Filtres de recherche avancés', 'Mode incognito'];
$entitlements = ['unlimited_likes' => true, 'see_who_liked' => true, 'advanced_filters' => true, 'incognito' => true, 'priority_messages' => false];

return [
    'plans' => [
        'launch-monthly' => [
            'name' => 'Premium mensuel', 'tagline' => 'Un mois pour découvrir les options',
            'duration_months' => 1, 'price' => 9.90,
            'stripe_price_id' => env('STRIPE_LAUNCH_MONTHLY_PRICE_ID'),
            'perks' => $perks, 'entitlements' => $entitlements,
            'gems_on_signup' => 0, 'gems_per_month' => 0,
            'is_featured' => false, 'display_order' => 1,
        ],
        'launch-quarterly' => [
            'name' => 'Premium trimestriel', 'tagline' => 'Les mêmes avantages pendant trois mois',
            'duration_months' => 3, 'price' => 24.90,
            'stripe_price_id' => env('STRIPE_LAUNCH_QUARTERLY_PRICE_ID'),
            'perks' => $perks, 'entitlements' => $entitlements,
            'gems_on_signup' => 0, 'gems_per_month' => 0,
            'is_featured' => false, 'display_order' => 2,
        ],
    ],
];
