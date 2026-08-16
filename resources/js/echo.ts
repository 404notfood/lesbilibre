import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo<'reverb'> | null;
    }
}

window.Pusher = Pusher;

/**
 * Reverb parle le protocole Pusher : le client reste `pusher-js`, mais les
 * variables sont préfixées `REVERB_`. Le repli sur `VITE_PUSHER_*` garde les
 * environnements encore câblés sur l'ancienne config (Soketi) fonctionnels.
 */
const appKey =
    import.meta.env.VITE_REVERB_APP_KEY ?? import.meta.env.VITE_PUSHER_APP_KEY;

const host =
    import.meta.env.VITE_REVERB_HOST ??
    import.meta.env.VITE_PUSHER_HOST ??
    window.location.hostname;

const scheme =
    import.meta.env.VITE_REVERB_SCHEME ??
    import.meta.env.VITE_PUSHER_SCHEME ??
    'https';

const port = Number(
    import.meta.env.VITE_REVERB_PORT ??
        import.meta.env.VITE_PUSHER_PORT ??
        (scheme === 'https' ? 443 : 80),
);

/**
 * Sans clé, `new Pusher()` lève immédiatement « You must pass your app key ».
 * Cette exception remonterait avant le rendu et casserait *toutes* les pages —
 * y compris /login, qui n'a pourtant aucun canal privé à écouter. On dégrade
 * donc plutôt que de jeter.
 */
const isConfigured = typeof appKey === 'string' && appKey.length > 0;

if (! isConfigured && import.meta.env.DEV) {
    console.warn(
        'VITE_REVERB_APP_KEY absente au moment du build : le temps réel est désactivé.',
    );
}

let instance: Echo<'reverb'> | null = null;

/**
 * Echo n'est construit qu'à la première écoute réelle : les pages invitées
 * (login, register, mot de passe oublié) n'ouvrent plus de websocket.
 */
export function getEcho(): Echo<'reverb'> | null {
    if (! isConfigured) {
        return null;
    }

    if (instance === null) {
        instance = new Echo({
            broadcaster: 'reverb',
            key: appKey,
            wsHost: host,
            wsPort: port,
            wssPort: port,
            forceTLS: scheme === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        window.Echo = instance;
    }

    return instance;
}

export default getEcho;
