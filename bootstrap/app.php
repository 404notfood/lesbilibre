<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->validateCsrfTokens(except: [
            'webhook/stripe',
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\RequestContext::class,
            \App\Http\Middleware\SecureHeaders::class,
            \App\Http\Middleware\SearchIndexingHeaders::class,
            \App\Http\Middleware\CheckNotBanned::class,
            \App\Http\Middleware\TrackUserPresence::class,
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Rate limiting aliases
        $middleware->alias([
            'throttle.strict' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':60,1',
            'throttle.api' => \Illuminate\Routing\Middleware\ThrottleRequests::class.':100,1',
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
