<?php

return [
    // Keep this list intentionally small and maintain it from an operational
    // source. It can be extended with ANTI_ABUSE_DISPOSABLE_DOMAINS.
    'disposable_domains' => array_filter(array_map('trim', explode(',', env(
        'ANTI_ABUSE_DISPOSABLE_DOMAINS',
        'mailinator.com,guerrillamail.com,tempmail.com,10minutemail.com,throwawaymail.com'
    )))),
    'registration_per_hour' => (int) env('ANTI_ABUSE_REGISTRATION_PER_HOUR', 5),
    'duplicate_message_window_minutes' => (int) env('ANTI_ABUSE_DUPLICATE_MESSAGE_WINDOW', 10),
];
