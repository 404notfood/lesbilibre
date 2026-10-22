<?php

return [
    // Internal warning thresholds, not promises made to members.
    'moderation_warning_hours' => 24,
    'video_warning_minutes' => 20,
    'tasks' => [
        'scheduler' => ['label' => 'Planificateur', 'max_age_minutes' => 5],
        'messages:retry-delivery' => ['label' => 'Transmission des messages validés', 'max_age_minutes' => 5],
        'privacy:retry-erasure' => ['label' => 'Reprise des effacements autorisés', 'max_age_minutes' => 15],
        'subscriptions:expire' => ['label' => 'Expiration des abonnements', 'max_age_minutes' => 1500],
        'privacy:prune-verification-photos' => ['label' => 'Purge des selfies', 'max_age_minutes' => 1500],
        'photos:prune-render-cache' => ['label' => 'Purge du cache photo', 'max_age_minutes' => 120],
        'ephemeral:prune' => ['label' => 'Purge des médias éphémères', 'max_age_minutes' => 1500],
    ],
];
