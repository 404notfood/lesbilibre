<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('subscriptions:expire')->dailyAt('02:00')->withoutOverlapping();
Schedule::command('privacy:prune-verification-photos --days=30')->dailyAt('03:30')->withoutOverlapping();
Schedule::command('photos:prune-render-cache')->hourly()->withoutOverlapping();
Schedule::command('ephemeral:prune')->dailyAt('04:00')->withoutOverlapping();
