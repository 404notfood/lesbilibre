<?php

return [
    'require_two_factor' => (bool) env('ADMIN_REQUIRE_TWO_FACTOR', true),
    'require_recent_password' => (bool) env('ADMIN_REQUIRE_RECENT_PASSWORD', env('APP_ENV', 'production') === 'production'),
    'password_timeout_seconds' => 900,
    'sensitive_routes' => ['admin.account-deletions.destroy', 'admin.users.destroy', 'admin.users.photos.destroy', 'admin.subscriptions.*', 'admin.billing.*', 'admin.gems.add', 'admin.gems.remove', 'admin.ephemeral.destroy', 'admin.seo.*'],
];
