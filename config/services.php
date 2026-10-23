<?php

return [

    'integrations' => [
        'google_pagespeed_api_key' => env('GOOGLE_PAGESPEED_API_KEY'),
        'google_search_console_credentials' => env('GOOGLE_SEARCH_CONSOLE_CREDENTIALS'),
        'semrush_api_key' => env('SEMRUSH_API_KEY'),
        'google_client_id' => env('GOOGLE_CLIENT_ID'),
        'google_client_secret' => env('GOOGLE_CLIENT_SECRET'),
    ],

    'indexnow' => [
        'key' => env('INDEXNOW_KEY'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'price_1_month' => env('STRIPE_PRICE_1_MONTH'),
        'price_3_months' => env('STRIPE_PRICE_3_MONTHS'),
        'price_6_months' => env('STRIPE_PRICE_6_MONTHS'),
    ],

    'webpush' => [
        'vapid_public_key' => env('VAPID_PUBLIC_KEY'),
        'vapid_private_key' => env('VAPID_PRIVATE_KEY'),
    ],

    'moderation' => [
        'url' => env('MODERATION_SERVICE_URL', 'http://127.0.0.1:8000'),
        'token' => env('MODERATION_API_TOKEN'),
        'quarantine_threshold' => (float) env('MODERATION_NSFW_QUARANTINE_THRESHOLD', 0.85),
    ],

];
