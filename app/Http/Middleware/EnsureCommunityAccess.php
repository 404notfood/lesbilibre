<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureCommunityAccess
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (! $user || $user->is_admin || $user->canUseCommunity()) {
            return $next($request);
        }
        // Keep account controls, support and onboarding available, including erasure.
        if ($request->routeIs('home', 'contact', 'terms', 'privacy', 'safety', 'community.*', 'logout', 'verification.*', 'profile.show', 'profile.edit', 'profile.update', 'photos.index', 'photos.store', 'photos.destroy', 'photos.primary', 'photos.request-avatar', 'media.photo', 'settings.*', 'user-password.*', 'password.*', 'two-factor.*', 'sessions.*', 'appearance.edit', 'premium.cancel', 'premium.billing-portal')) {
            return $next($request);
        }
        if ($request->expectsJson()) {
            return response()->json(['message' => 'Complétez votre déclaration de majorité, la charte et la vérification des photos.', 'redirect' => route('community.onboarding')], 403);
        }

        return redirect()->route('community.onboarding');
    }
}
