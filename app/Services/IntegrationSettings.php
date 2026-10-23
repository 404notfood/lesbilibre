<?php

namespace App\Services;

use App\Models\IntegrationCredential;
use App\Models\Setting;

class IntegrationSettings
{
    public const FIELDS = [
        'google_pagespeed_api_key',
        'google_search_console_credentials',
        'semrush_api_key',
        'google_client_id',
        'google_client_secret',
    ];

    public function get(string $name): ?string
    {
        abort_unless(in_array($name, self::FIELDS, true), 422);

        return IntegrationCredential::query()->where('name', $name)->first()?->value
            ?? config('services.integrations.'.$name);
    }

    public function googleEnabled(): bool
    {
        return (bool) Setting::get('google_login_enabled', false)
            && filled($this->get('google_client_id')) && filled($this->get('google_client_secret'));
    }

    public function status(): array
    {
        return collect(self::FIELDS)->mapWithKeys(fn (string $name) => [
            $name => [
                'configured' => filled($this->get($name)),
                'source' => IntegrationCredential::query()->where('name', $name)->exists() ? 'database' : 'environment',
            ],
        ])->all();
    }

    public function callbackUrl(): string
    {
        return rtrim(config('app.url'), '/').'/auth/google/callback';
    }
}
