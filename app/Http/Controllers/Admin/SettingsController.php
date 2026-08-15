<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/Index', [
            'settings' => [
                'app_name' => config('app.name'),
                'app_url' => config('app.url'),
                'app_env' => config('app.env'),
                'app_debug' => (bool) config('app.debug'),
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'timezone' => config('app.timezone'),
                'locale' => config('app.locale'),
            ],
            'services' => [
                'mailer' => config('mail.default'),
                'mail_from' => config('mail.from.address'),
                'queue' => config('queue.default'),
                'cache' => config('cache.default'),
                'session' => config('session.driver'),
                'filesystem' => config('filesystems.default'),
                'broadcast' => config('broadcasting.default'),
                'stripe_configured' => filled(config('services.stripe.secret')),
                'stripe_webhook_configured' => filled(config('services.stripe.webhook_secret')),
            ],
            'health' => $this->health(),
        ]);
    }

    /**
     * Contrôles de bon fonctionnement affichés dans la console.
     *
     * @return array<string, mixed>
     */
    private function health(): array
    {
        // Un abonnement encore actif dont l'échéance est passée signale que la
        // tâche planifiée subscriptions:expire n'a pas tourné.
        $staleSubscriptions = Subscription::query()
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->count();

        $failedJobs = Schema::hasTable('failed_jobs')
            ? DB::table('failed_jobs')->count()
            : 0;

        $pendingJobs = Schema::hasTable('jobs')
            ? DB::table('jobs')->count()
            : 0;

        return [
            'stale_subscriptions' => $staleSubscriptions,
            'failed_jobs' => $failedJobs,
            'pending_jobs' => $pendingJobs,
            'debug_in_production' => config('app.env') === 'production' && config('app.debug'),
            'storage_linked' => is_link(public_path('storage')) || is_dir(public_path('storage')),
        ];
    }
}
