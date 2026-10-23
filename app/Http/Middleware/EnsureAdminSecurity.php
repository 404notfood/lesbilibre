<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureAdminSecurity
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if (! $user?->is_admin || ! $request->routeIs('admin.*')) {
            return $next($request);
        }
        // These redirects run before Inertia can convert write redirects to GET.
        $redirectStatus = $request->isMethodSafe() ? 302 : 303;

        if (config('admin-security.require_two_factor') && (blank($user->two_factor_secret) || ! $user->two_factor_confirmed_at)) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Activez et confirmez la double authentification pour accéder à l’administration.', 'redirect' => route('two-factor.show')], 403);
            }

            return redirect()->route('two-factor.show', [], $redirectStatus)->with('error', 'L’administration nécessite une double authentification confirmée.');
        }
        if (config('admin-security.require_recent_password') && ! $request->isMethodSafe() && $request->routeIs(...config('admin-security.sensitive_routes'))
            && time() - (int) $request->session()->get('auth.password_confirmed_at', 0) > config('admin-security.password_timeout_seconds')) {
            if ($request->expectsJson()) {
                return response()->json(['message' => 'Confirmez récemment votre mot de passe avant cette action.', 'redirect' => route('password.confirm')], 423);
            }

            return redirect()->route('password.confirm', [], $redirectStatus);
        }

        return $next($request);
    }
}
