<?php

/*
|--------------------------------------------------------------------------
| Catalogue des avantages premium
|--------------------------------------------------------------------------
|
| Chaque plan coche les avantages qu'il accorde depuis la console admin. Ce
| fichier est la source de vérité de ce qui est cochable : ajouter une entrée
| ici la fait apparaître dans le formulaire d'édition des plans.
|
| Les quotas ('quota' => true) sont saisis par plan avec une valeur chiffrée ;
| les autres sont de simples interrupteurs.
|
*/

return [

    /*
    | Limites appliquées aux comptes sans abonnement actif. Un plan premium
    | qui n'accorde pas explicitement un avantage retombe sur ces valeurs.
    */
    'free' => [
        'likes_per_day' => 20,
        'first_messages_per_day' => 5,
        'see_who_liked' => false,
        'advanced_filters' => false,
        'incognito' => false,
        'priority_messages' => false,
        'unlimited_likes' => false,
        'profile_boost' => false,
        'read_receipts' => false,
    ],

    /*
    | Catalogue affiché dans l'admin et sur la page premium.
    |
    | key     : identifiant stocké dans premium_plans.perks
    | label   : libellé affiché aux membres
    | hint    : précision pour l'administratrice
    | quota   : true si l'avantage porte un nombre saisissable
    | unit    : suffixe affiché à côté du nombre
    */
    'catalog' => [
        [
            'key' => 'unlimited_likes',
            'label' => 'Likes illimités',
            'hint' => 'Supprime la limite quotidienne de likes.',
            'quota' => false,
        ],
        [
            'key' => 'likes_per_day',
            'label' => 'Likes par jour',
            'hint' => 'Ignoré si « Likes illimités » est coché.',
            'quota' => true,
            'unit' => 'likes / jour',
            'default' => 100,
        ],
        [
            'key' => 'first_messages_per_day',
            'label' => 'Premiers messages par jour',
            'hint' => 'Nombre de conversations qu’elle peut ouvrir chaque jour. 0 = illimité.',
            'quota' => true,
            'unit' => 'messages / jour',
            'default' => 30,
        ],
        [
            'key' => 'see_who_liked',
            'label' => 'Voir qui vous a likée',
            'hint' => 'Accès à la liste complète des likes reçus.',
            'quota' => false,
        ],
        [
            'key' => 'advanced_filters',
            'label' => 'Filtres de recherche avancés',
            'hint' => 'Critères exclusifs dans la découverte.',
            'quota' => false,
        ],
        [
            'key' => 'incognito',
            'label' => 'Mode incognito',
            'hint' => 'Naviguer sans apparaître dans les visites de profil.',
            'quota' => false,
        ],
        [
            'key' => 'priority_messages',
            'label' => 'Messages prioritaires',
            'hint' => 'Les messages apparaissent en tête de conversation.',
            'quota' => false,
        ],
        [
            'key' => 'profile_boost',
            'label' => 'Boost de profil mensuel',
            'hint' => 'Mise en avant dans la découverte.',
            'quota' => false,
        ],
        [
            'key' => 'read_receipts',
            'label' => 'Accusés de lecture',
            'hint' => 'Savoir quand un message a été lu.',
            'quota' => false,
        ],
    ],
];
