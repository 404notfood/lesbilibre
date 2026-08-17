<?php

return [
    'enabled' => env('REFERRALS_ENABLED', true),
    'referrer_reward' => (int) env('REFERRAL_REFERRER_REWARD', 150),
    'referred_reward' => (int) env('REFERRAL_REFERRED_REWARD', 50),
];
