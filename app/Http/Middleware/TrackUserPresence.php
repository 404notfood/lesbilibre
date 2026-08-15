<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Entretient `last_activity_at` à chaque requête authentifiée.
 *
 * Sans ce suivi, la présence en ligne reposait sur `last_login_at` — une
 * colonne que rien ne mettait à jour : personne n'apparaissait jamais
 * connectée, même en naviguant sur le site.
 */
class TrackUserPresence
{
    /** Fréquence d'écriture : inutile de toucher la base à chaque requête. */
    private const REFRESH_SECONDS = 60;

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user !== null) {
            $lastSeen = $user->last_activity_at;

            if ($lastSeen === null || $lastSeen->diffInSeconds(now()) >= self::REFRESH_SECONDS) {
                $user->forceFill(['last_activity_at' => now()])->saveQuietly();
            }
        }

        return $next($request);
    }
}
