<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class SecureHeaders
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Capture the session before logout clears the authentication guard.
        $authenticated = $request->user() !== null;
        $userId = $request->user()?->id;
        $pushEndpoint = $request->hasSession() ? $request->session()->get('pwa.push_endpoint') : null;
        // Inertia stores navigation state separately from the HTTP/SW caches.
        // Web Crypto requires HTTPS (local HTTP tools retain their fallback).
        Inertia::encryptHistory($authenticated && $request->isSecure());
        $response = $next($request);
        if ($authenticated && $request->user() === null) {
            Inertia::clearHistory();
            // Revoke this browser on the server even if its local worker is
            // offline. Other devices keep their own notification subscriptions.
            if (is_string($pushEndpoint)) {
                \App\Models\PushSubscription::where('user_id', $userId)->where('endpoint', $pushEndpoint)->delete();
            }
        }

        // The worker excludes private data; HTTP caches must exclude it too.
        if ($authenticated || $request->hasHeader('X-Inertia')) {
            $response->headers->set('Cache-Control', 'private, no-store, max-age=0');
            $response->headers->set('Pragma', 'no-cache');
            $response->headers->set('Expires', '0');
        }

        // Security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(self), microphone=(), camera=()');

        // HSTS (HTTP Strict Transport Security) - only in production
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        return $response;
    }
}
