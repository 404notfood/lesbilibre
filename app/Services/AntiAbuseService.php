<?php

namespace App\Services;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class AntiAbuseService
{
    public function assertRegistrationAllowed(string $email, Request $request): void
    {
        $domain = strtolower((string) substr(strrchr($email, '@') ?: '', 1));

        if (in_array($domain, config('anti_abuse.disposable_domains'), true)) {
            throw ValidationException::withMessages([
                'email' => 'Les adresses e-mail temporaires ne sont pas acceptées.',
            ]);
        }

        $key = 'registration:'.$request->ip();
        $limit = config('anti_abuse.registration_per_hour');
        if (RateLimiter::tooManyAttempts($key, $limit)) {
            throw ValidationException::withMessages([
                'email' => 'Trop de créations de compte depuis cette connexion. Réessaie plus tard.',
            ]);
        }

        RateLimiter::hit($key, 3600);
    }

    public function assertMessageAllowed(User $user, string $content): void
    {
        $normalized = preg_replace('/\s+/', ' ', trim(mb_strtolower($content)));
        $window = now()->subMinutes(config('anti_abuse.duplicate_message_window_minutes'));

        if (Message::where('sender_id', $user->id)
            ->where('created_at', '>=', $window)
            ->whereRaw('LOWER(content) = ?', [$normalized])
            ->exists()) {
            throw ValidationException::withMessages([
                'content' => 'Ce message a déjà été envoyé récemment.',
            ]);
        }

        if (preg_match('/(?:https?:\/\/|www\.)/i', $content)) {
            throw ValidationException::withMessages([
                'content' => 'Les liens ne sont pas autorisés dans les messages pour protéger la communauté.',
            ]);
        }

        if (preg_match('/(?:\+?\d[\s().-]*){8,}/', $content)) {
            throw ValidationException::withMessages([
                'content' => 'Les coordonnées personnelles ne peuvent pas être partagées dans les messages.',
            ]);
        }
    }
}
