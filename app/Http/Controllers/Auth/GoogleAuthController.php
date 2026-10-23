<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\IntegrationSettings;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Fortify\Features;

class GoogleAuthController extends Controller
{
    public function redirect(Request $request, IntegrationSettings $settings): RedirectResponse
    {
        abort_unless($settings->googleEnabled(), 404);
        $state = Str::random(64);
        $verifier = Str::random(96);
        $request->session()->forget('google_registration');
        $request->session()->put('google_oauth', [
            'state' => $state, 'verifier' => $verifier, 'expires_at' => now()->addMinutes(10)->timestamp,
        ]);

        return redirect()->away('https://accounts.google.com/o/oauth2/v2/auth?'.http_build_query([
            'client_id' => $settings->get('google_client_id'),
            'redirect_uri' => $settings->callbackUrl(),
            'response_type' => 'code',
            'scope' => 'openid email profile',
            'state' => $state,
            'code_challenge' => rtrim(strtr(base64_encode(hash('sha256', $verifier, true)), '+/', '-_'), '='),
            'code_challenge_method' => 'S256',
            'prompt' => 'select_account',
        ], '', '&', PHP_QUERY_RFC3986));
    }

    public function callback(Request $request, IntegrationSettings $settings): RedirectResponse
    {
        abort_unless($settings->googleEnabled(), 404);
        $flow = $request->session()->pull('google_oauth');
        if (! is_array($flow) || ! is_string($request->query('state'))
            || ! hash_equals($flow['state'], $request->query('state')) || $flow['expires_at'] < now()->timestamp) {
            return $this->failure('La session Google a expiré. Recommence la connexion.');
        }
        if ($request->query('error') || ! is_string($request->query('code')) || strlen($request->query('code')) > 4096) {
            return $this->failure('La connexion Google a été annulée ou refusée.');
        }

        try {
            $tokens = Http::asForm()->timeout(10)->post('https://oauth2.googleapis.com/token', [
                'code' => $request->query('code'),
                'client_id' => $settings->get('google_client_id'),
                'client_secret' => $settings->get('google_client_secret'),
                'redirect_uri' => $settings->callbackUrl(),
                'grant_type' => 'authorization_code',
                'code_verifier' => $flow['verifier'],
            ])->throw()->json();
            if (! is_string($tokens['access_token'] ?? null) || blank($tokens['access_token'])) {
                return $this->failure('Google n’a pas pu confirmer cette connexion.');
            }
            $identity = Http::withToken($tokens['access_token'])->timeout(10)
                ->get('https://openidconnect.googleapis.com/v1/userinfo')->throw()->json();
        } catch (ConnectionException|RequestException $exception) {
            return $this->failure('Google est momentanément indisponible. Réessaie ou utilise ton mot de passe.');
        }

        if (! is_array($identity) || ! is_string($identity['sub'] ?? null) || blank($identity['sub'])
            || strlen($identity['sub']) > 255 || ($identity['email_verified'] ?? false) !== true
            || ! is_string($identity['email'] ?? null) || strlen($identity['email']) > 255
            || ! filter_var($identity['email'], FILTER_VALIDATE_EMAIL)) {
            return $this->failure('Google n’a pas fourni une adresse e-mail vérifiée.');
        }

        $user = User::withTrashed()->where('google_id', $identity['sub'])->first();
        if ($user) {
            if ($user->trashed() || $user->is_banned) {
                return $this->failure('Ce compte est indisponible. Contacte le support.');
            }
            $request->session()->regenerate();
            if (Features::enabled(Features::twoFactorAuthentication()) && filled($user->two_factor_secret) && $user->two_factor_confirmed_at) {
                $request->session()->put(['login.id' => $user->id, 'login.remember' => false]);

                return redirect()->route('two-factor.login');
            }
            Auth::login($user);

            return redirect()->intended(route('dashboard'));
        }

        if (User::withTrashed()->where('email', $identity['email'])->exists()) {
            return $this->failure('Un compte utilise déjà cette adresse. Connecte-toi avec ton mot de passe pour préserver la sécurité de ce compte.');
        }
        if (! Features::enabled(Features::registration())) {
            return $this->failure('Les nouvelles inscriptions sont actuellement fermées.');
        }

        $request->session()->regenerate();
        $request->session()->put('google_registration', [
            'sub' => $identity['sub'],
            'email' => $identity['email'],
            'name' => mb_substr((string) ($identity['given_name'] ?? $identity['name'] ?? ''), 0, 255),
            'authoritative_email' => str_ends_with(strtolower($identity['email']), '@gmail.com') || filled($identity['hd'] ?? null),
            'expires_at' => now()->addMinutes(20)->timestamp,
        ]);

        return redirect()->route('register');
    }

    private function failure(string $message): RedirectResponse
    {
        return redirect()->route('login')->with('error', $message);
    }
}
