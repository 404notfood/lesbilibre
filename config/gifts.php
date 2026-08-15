<?php

/*
|--------------------------------------------------------------------------
| Catalogue des cadeaux
|--------------------------------------------------------------------------
|
| Source unique pour l'affichage boutique et la validation d'envoi.
| Les cadeaux de la catégorie « naughty » ne sont proposés qu'aux membres
| ayant activé leur mode coquin.
|
*/

return [
    // Romantique
    1 => ['name' => 'Rose Rouge', 'emoji' => '🌹', 'price' => 10, 'category' => 'romantic'],
    2 => ['name' => 'Bouquet', 'emoji' => '💐', 'price' => 25, 'category' => 'romantic'],
    3 => ['name' => 'Coeur', 'emoji' => '💖', 'price' => 15, 'category' => 'romantic'],
    4 => ['name' => 'Bague', 'emoji' => '💍', 'price' => 50, 'category' => 'romantic'],

    // Fun
    5 => ['name' => 'Café', 'emoji' => '☕', 'price' => 5, 'category' => 'fun'],
    6 => ['name' => 'Champagne', 'emoji' => '🍾', 'price' => 30, 'category' => 'fun'],
    7 => ['name' => 'Gâteau', 'emoji' => '🎂', 'price' => 20, 'category' => 'fun'],
    8 => ['name' => 'Cocktail', 'emoji' => '🍹', 'price' => 15, 'category' => 'fun'],

    // Luxe
    9 => ['name' => 'Couronne', 'emoji' => '👑', 'price' => 100, 'category' => 'luxury'],
    10 => ['name' => 'Diamant', 'emoji' => '💎', 'price' => 150, 'category' => 'luxury'],
    11 => ['name' => 'Voiture de Luxe', 'emoji' => '🚗', 'price' => 200, 'category' => 'luxury'],
    12 => ['name' => 'Jet Privé', 'emoji' => '✈️', 'price' => 500, 'category' => 'luxury'],

    // Coquin — réservé aux profils en mode coquin
    13 => ['name' => 'Bisou', 'emoji' => '💋', 'price' => 8, 'category' => 'naughty'],
    14 => ['name' => 'Message Hot', 'emoji' => '🔥', 'price' => 12, 'category' => 'naughty'],
    15 => ['name' => 'Lingerie', 'emoji' => '👙', 'price' => 35, 'category' => 'naughty'],
    16 => ['name' => 'Menottes', 'emoji' => '⛓️', 'price' => 40, 'category' => 'naughty'],
    17 => ['name' => 'Nuit Torride', 'emoji' => '🌶️', 'price' => 60, 'category' => 'naughty'],
    18 => ['name' => 'Massage Sensuel', 'emoji' => '💆', 'price' => 45, 'category' => 'naughty'],
    19 => ['name' => 'Plume Coquine', 'emoji' => '🪶', 'price' => 20, 'category' => 'naughty'],
    20 => ['name' => 'Fantasme', 'emoji' => '😈', 'price' => 75, 'category' => 'naughty'],
];
