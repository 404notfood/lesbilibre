<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateSeoSettingsRequest;
use App\Http\Requests\Admin\UpdateIntegrationSettingsRequest;
use App\Models\IntegrationCredential;
use App\Models\Setting;
use App\Services\IntegrationSettings;
use App\Services\SeoSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class SeoSettingsController extends Controller
{
    public function index(SeoSettings $seo, IntegrationSettings $integrations): Response
    {
        return Inertia::render('Admin/Seo/Index', [
            'seoSettings' => [
                'indexingEnabled' => $seo->indexingEnabled(),
                'customRobots' => filled(Setting::get('seo_robots_content')),
                'robotsContent' => Setting::get('seo_robots_content') ?: $seo->publicRobots(),
                'effectiveRobots' => $seo->robots(),
            ],
            'integrations' => [
                'credentials' => $integrations->status(),
                'googleEnabled' => $integrations->googleEnabled(),
                'searchConsoleProperty' => Setting::get('google_search_console_property', ''),
                'callbackUrl' => $integrations->callbackUrl(),
            ],
        ]);
    }

    public function updateRobots(UpdateSeoSettingsRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            Setting::set('seo_indexing_enabled', $request->boolean('indexing_enabled'), 'boolean', 'seo');
            if ($request->boolean('custom_robots')) {
                Setting::set('seo_robots_content', rtrim(str_replace(["\r\n", "\r"], "\n", $request->validated('robots_content')))."\n", 'string', 'seo');
            } else {
                Setting::query()->where('key', 'seo_robots_content')->delete();
            }
        });

        return back()->with('success', 'Réglages SEO enregistrés. Le robots.txt est mis à jour immédiatement.');
    }

    public function updateIntegrations(UpdateIntegrationSettingsRequest $request, IntegrationSettings $integrations): RedirectResponse
    {
        foreach (['google_client_id', 'google_client_secret'] as $field) {
            $value = $request->filled($field) ? $request->validated($field) : $integrations->get($field);
            if ($request->boolean('remove_'.$field)) {
                $value = config('services.integrations.'.$field);
            }
            if ($request->boolean('google_login_enabled') && blank($value)) {
                throw ValidationException::withMessages([$field => 'Renseignez cet identifiant avant d’activer la connexion Google.']);
            }
        }

        DB::transaction(function () use ($request) {
            foreach (IntegrationSettings::FIELDS as $field) {
                if ($request->boolean('remove_'.$field)) {
                    IntegrationCredential::query()->where('name', $field)->delete();
                } elseif ($request->filled($field)) {
                    IntegrationCredential::query()->updateOrCreate(['name' => $field], ['value' => $request->validated($field)]);
                }
            }
            Setting::set('google_login_enabled', $request->boolean('google_login_enabled'), 'boolean', 'integrations');
            Setting::set('google_search_console_property', $request->validated('google_search_console_property') ?? '', 'string', 'integrations');
        });

        return back()->with('success', 'Identifiants enregistrés. Les secrets sont conservés chiffrés.');
    }
}
