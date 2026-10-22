<?php

return [
    'allowed_hosts' => [
        'fcm.googleapis.com',
        'updates.push.services.mozilla.com',
        'web.push.apple.com',
        '.notify.windows.com',
    ],
    'max_subscriptions_per_user' => 10,
    // Text is never previewed. An optional public pseudo may appear, never a
    // real name or email address; the default remains a generic notification.
    'show_sender_pseudo' => (bool) env('WEBPUSH_SHOW_SENDER_PSEUDO', false),
];
