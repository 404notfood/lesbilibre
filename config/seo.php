<?php

return [
    /*
    | Keep preview environments out of search indexes. On the final domain,
    | set SEO_INDEXING_ENABLED=true after APP_URL has been updated.
    */
    'indexing_enabled' => (bool) env('SEO_INDEXING_ENABLED', false),

    'support_email' => env('SUPPORT_EMAIL', env('MAIL_FROM_ADDRESS', 'support@lesbilibre.fr')),

    'default' => [
        'title' => 'LesbiLibre — Rencontres lesbiennes sincères',
        'description' => 'LesbiLibre est une plateforme de rencontres pensée pour les femmes qui aiment les femmes, avec profils vérifiés et confidentialité maîtrisée.',
    ],

    'public_routes' => [
        'home', 'about', 'faq', 'contact', 'terms', 'privacy',
        'how-it-works', 'safety', 'features', 'pricing', 'guides.index', 'guides.show',
    ],

    'pages' => [
        'home' => [
            'title' => 'Rencontres lesbiennes sincères | LesbiLibre',
            'description' => 'Rencontrez des femmes qui partagent vos envies dans un espace confidentiel, modéré et pensé pour des échanges sincères.',
        ],
        'about' => [
            'title' => 'À propos de LesbiLibre',
            'description' => 'Découvrez la mission, les engagements et le fonctionnement de LesbiLibre, plateforme de rencontres entre femmes.',
        ],
        'faq' => [
            'title' => 'Questions fréquentes | LesbiLibre',
            'description' => 'Compte, matching, médias, vérification, sécurité et paiements : les réponses à vos questions sur LesbiLibre.',
        ],
        'contact' => [
            'title' => 'Contacter LesbiLibre',
            'description' => 'Contactez l’équipe LesbiLibre pour une question de compte, de sécurité, de confidentialité ou de paiement.',
        ],
        'terms' => [
            'title' => 'Conditions générales | LesbiLibre',
            'description' => 'Consultez les conditions générales d’utilisation de LesbiLibre.',
        ],
        'privacy' => [
            'title' => 'Politique de confidentialité | LesbiLibre',
            'description' => 'Découvrez comment LesbiLibre collecte, protège et vous permet de contrôler vos données personnelles.',
        ],
        'how-it-works' => [
            'title' => 'Comment fonctionne LesbiLibre ?',
            'description' => 'De l’inscription au premier message : découvrez comment créer votre profil, vérifier votre compte et faire des rencontres sur LesbiLibre.',
        ],
        'safety' => [
            'title' => 'Sécurité des rencontres en ligne | LesbiLibre',
            'description' => 'Vérification, signalement, galeries privées et conseils de rencontre : tous les outils de sécurité de LesbiLibre.',
        ],
        'features' => [
            'title' => 'Fonctionnalités de LesbiLibre',
            'description' => 'Découvrez la recherche, les matchs, la messagerie, les médias éphémères et les contrôles de confidentialité de LesbiLibre.',
        ],
        'pricing' => [
            'title' => 'Tarifs et Premium | LesbiLibre',
            'description' => 'Comparez clairement les fonctions gratuites, les options Premium et les packs de gemmes proposés sur LesbiLibre.',
        ],
        'guides.index' => [
            'title' => 'Guides de rencontre et de sécurité | LesbiLibre',
            'description' => 'Des conseils concrets pour créer un bon profil, démarrer une conversation et faire des rencontres en ligne en sécurité.',
        ],
        'guides.show' => [
            'title' => 'Guide LesbiLibre',
            'description' => 'Conseils pratiques de LesbiLibre pour des rencontres plus sincères et plus sûres.',
        ],
    ],
];
