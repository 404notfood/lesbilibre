<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(fn () => app(\App\Services\OperationalHealthService::class)->record('scheduler', 'success'))
    ->name('operations:heartbeat')->everyMinute();
foreach (['messages:retry-delivery' => 1, 'privacy:retry-erasure' => 5] as $command => $minutes) {
    $event = Schedule::command($command)->withoutOverlapping();
    $minutes === 1 ? $event->everyMinute() : $event->everyFiveMinutes();
    $event->before(fn () => app(\App\Services\OperationalHealthService::class)->record($command, 'started'))
        ->onSuccess(fn () => app(\App\Services\OperationalHealthService::class)->record($command, 'success'))
        ->onFailure(fn () => app(\App\Services\OperationalHealthService::class)->record($command, 'failed'));
}

foreach ([
    'subscriptions:expire' => ['subscriptions:expire', '02:00'],
    'privacy:prune-verification-photos' => ['privacy:prune-verification-photos --days=30', '03:30'],
    'photos:prune-render-cache' => ['photos:prune-render-cache', null],
    'ephemeral:prune' => ['ephemeral:prune', '04:00'],
] as $name => [$command, $time]) {
    $event = Schedule::command($command)->withoutOverlapping();
    $time ? $event->dailyAt($time) : $event->hourly();
    $event->before(fn () => app(\App\Services\OperationalHealthService::class)->record($name, 'started'))
        ->onSuccess(fn () => app(\App\Services\OperationalHealthService::class)->record($name, 'success'))
        ->onFailure(fn () => app(\App\Services\OperationalHealthService::class)->record($name, 'failed'));
}
