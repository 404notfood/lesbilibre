import { useCallback, useEffect, useRef, useState } from 'react';

type PushPermissionState = NotificationPermission | 'unsupported';
type PushResult = { ok: boolean; message: string };
const REQUEST_TIMEOUT = 10_000;
class PushSetupError extends Error {}

function supported(): boolean {
    if (
        typeof window === 'undefined' ||
        !window.isSecureContext ||
        !('Notification' in window) ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window)
    )
        return false;
    const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    return (
        !isIOS ||
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const rawData = window.atob(
        (base64String + padding).replace(/-/g, '+').replace(/_/g, '/'),
    );
    return Uint8Array.from(rawData, (character) => character.charCodeAt(0));
}

async function readyWorker(): Promise<ServiceWorkerRegistration> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        return await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<never>((_, reject) => {
                timer = setTimeout(
                    () =>
                        reject(
                            new PushSetupError(
                                'L’application n’est pas encore prête pour les notifications. Réessaie dans un instant.',
                            ),
                        ),
                    REQUEST_TIMEOUT,
                );
            }),
        ]);
    } finally {
        if (timer) clearTimeout(timer);
    }
}

async function api(path: string, payload?: object): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    try {
        const response = await fetch(path, {
            method: payload ? 'POST' : 'GET',
            credentials: 'same-origin',
            cache: 'no-store',
            signal: controller.signal,
            headers: {
                Accept: 'application/json',
                ...(payload
                    ? {
                          'Content-Type': 'application/json',
                          'X-CSRF-TOKEN':
                              document.querySelector<HTMLMetaElement>(
                                  'meta[name="csrf-token"]',
                              )?.content ?? '',
                      }
                    : {}),
            },
            ...(payload ? { body: JSON.stringify(payload) } : {}),
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 419)
                throw new PushSetupError(
                    'La session a expiré. Reconnecte-toi avant de réessayer.',
                );
            if (response.status === 403)
                throw new PushSetupError(
                    'Termine les étapes d’accès à la communauté avant d’activer les notifications.',
                );
            if (response.status === 409)
                throw new PushSetupError(
                    'L’activation n’a pas été confirmée pour ce compte. Réessaie pour renouveler cet abonnement.',
                );
            if (response.status === 422)
                throw new PushSetupError(
                    'L’appareil n’a pas pu être enregistré. Vérifie le nombre d’appareils autorisés ou réessaie plus tard.',
                );
            throw new PushSetupError(
                'Le service de notifications est temporairement indisponible. Réessaie plus tard.',
            );
        }
        return response;
    } catch (error) {
        if (error instanceof Error && error.name === 'AbortError')
            throw new PushSetupError(
                'Le service met trop de temps à répondre. Réessaie plus tard.',
            );
        if (error instanceof TypeError)
            throw new PushSetupError(
                'La connexion au service a échoué. Vérifie ton réseau puis réessaie.',
            );
        throw error;
    } finally {
        clearTimeout(timer);
    }
}

function messageOf(error: unknown): string {
    return error instanceof PushSetupError
        ? error.message
        : 'Les notifications n’ont pas pu être modifiées. Vérifie les réglages du navigateur ou réessaie plus tard.';
}

async function configuredPublicKey(): Promise<Uint8Array> {
    if (!navigator.onLine)
        throw new PushSetupError(
            'Retrouve une connexion pour vérifier les notifications.',
        );
    const response = await api('/push/vapid-key');
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        const json: unknown = await Promise.race([
            response.json(),
            new Promise<never>((_, reject) => {
                timer = setTimeout(
                    () =>
                        reject(
                            new PushSetupError(
                                'Le service met trop de temps à répondre. Réessaie plus tard.',
                            ),
                        ),
                    REQUEST_TIMEOUT,
                );
            }),
        ]);
        const key =
            typeof json === 'object' && json !== null && 'publicKey' in json
                ? json.publicKey
                : null;
        if (typeof key !== 'string' || !key)
            throw new PushSetupError(
                'Les notifications ne sont pas encore configurées sur ce service. Tu peux continuer à utiliser le site.',
            );
        const bytes = urlBase64ToUint8Array(key);
        if (bytes.length !== 65 || bytes[0] !== 4)
            throw new PushSetupError(
                'La configuration des notifications est indisponible. Réessaie plus tard.',
            );
        return bytes;
    } catch (caught) {
        if (caught instanceof PushSetupError) throw caught;
        throw new PushSetupError(
            'La configuration des notifications est indisponible. Réessaie plus tard.',
        );
    } finally {
        if (timer) clearTimeout(timer);
    }
}

export function usePushNotifications(enabled = true) {
    const [permission, setPermission] = useState<PushPermissionState>(() =>
        supported() ? Notification.permission : 'unsupported',
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(enabled);
    const [isConfigured, setIsConfigured] = useState<boolean | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [needsCleanup, setNeedsCleanup] = useState(false);
    const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
    const publicKeyRef = useRef<Uint8Array | null>(null);
    const pendingRemoval = useRef<string | null>(null);
    const working = useRef(false);
    const active = useRef(true);
    const checkGeneration = useRef(0);

    const checkAvailability = useCallback(async () => {
        const generation = ++checkGeneration.current;
        if (!enabled || !supported()) {
            setIsChecking(false);
            return;
        }
        setIsChecking(true);
        setError(null);
        const [worker, key] = await Promise.allSettled([
            readyWorker().then(async (registration) => ({
                registration,
                subscription: await registration.pushManager.getSubscription(),
            })),
            configuredPublicKey(),
        ]);
        if (!active.current || generation !== checkGeneration.current) return;
        setPermission(Notification.permission);
        // Device revocation stays available even when the server's VAPID
        // configuration or the network is unavailable.
        if (worker.status === 'fulfilled') {
            registrationRef.current = worker.value.registration;
            setIsSubscribed(
                Boolean(worker.value.subscription) &&
                    Notification.permission === 'granted',
            );
        }
        publicKeyRef.current = key.status === 'fulfilled' ? key.value : null;
        setIsConfigured(
            worker.status === 'fulfilled' && key.status === 'fulfilled',
        );
        if (key.status === 'rejected') setError(messageOf(key.reason));
        else if (worker.status === 'rejected')
            setError(messageOf(worker.reason));
        setIsChecking(false);
    }, [enabled]);

    useEffect(() => {
        active.current = true;
        void checkAvailability();
        const refreshPermission = () => {
            if (!supported()) return;
            setPermission(Notification.permission);
            if (Notification.permission !== 'granted') setIsSubscribed(false);
        };
        const reset = () => {
            checkGeneration.current += 1;
            pendingRemoval.current = null;
            setNeedsCleanup(false);
            setIsSubscribed(false);
            setNotice(null);
        };
        window.addEventListener('focus', refreshPermission);
        window.addEventListener('pwa:session-ended', reset);
        return () => {
            active.current = false;
            checkGeneration.current += 1;
            window.removeEventListener('focus', refreshPermission);
            window.removeEventListener('pwa:session-ended', reset);
        };
    }, [checkAvailability]);

    const subscribe = useCallback(async (): Promise<PushResult> => {
        if (working.current)
            return {
                ok: false,
                message: 'Une modification est déjà en cours.',
            };
        if (!enabled || !supported())
            return {
                ok: false,
                message:
                    'Ce navigateur ne permet pas les notifications. Sur iPhone ou iPad, ouvre LesbiLibre depuis l’écran d’accueil.',
            };
        if (!navigator.onLine) {
            const message =
                'Retrouve une connexion pour activer les notifications.';
            setError(message);
            return { ok: false, message };
        }
        if (!publicKeyRef.current) {
            const message =
                'Les notifications ne sont pas encore prêtes. Utilise « Vérifier à nouveau ».';
            setError(message);
            return { ok: false, message };
        }
        const publicKey = publicKeyRef.current;
        working.current = true;
        setIsLoading(true);
        setError(null);
        setNotice(null);
        let subscription: PushSubscription | null = null;
        try {
            // This is the only requestPermission call, reached by an explicit
            // button action. Public configuration was checked beforehand.
            const result =
                Notification.permission === 'default'
                    ? await Notification.requestPermission()
                    : Notification.permission;
            setPermission(result);
            if (!active.current)
                return { ok: false, message: 'Activation interrompue.' };
            if (result !== 'granted') {
                const message =
                    result === 'denied'
                        ? 'Notifications refusées. Tu peux les autoriser dans les réglages du navigateur ou de l’appareil.'
                        : 'Notifications non activées. Tu peux décider plus tard.';
                setNotice(message);
                return { ok: false, message };
            }
            const registration =
                registrationRef.current ?? (await readyWorker());
            subscription =
                (await registration.pushManager.getSubscription()) ??
                (await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: publicKey as BufferSource,
                }));
            const json = subscription.toJSON();
            await api('/push/subscribe', {
                endpoint: json.endpoint,
                keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
                contentEncoding:
                    PushManager.supportedContentEncodings?.includes('aes128gcm')
                        ? 'aes128gcm'
                        : 'aesgcm',
            });
            setIsSubscribed(true);
            const message = 'Notifications activées sur cet appareil.';
            setNotice(message);
            return { ok: true, message };
        } catch (caught) {
            // An HTTP rejection must never be presented as an activation. A
            // browser subscription without a confirmed owner is revoked.
            if (subscription)
                await subscription.unsubscribe().catch(() => false);
            setIsSubscribed(false);
            const message = messageOf(caught);
            setError(message);
            return { ok: false, message };
        } finally {
            working.current = false;
            if (active.current) setIsLoading(false);
        }
    }, [enabled]);

    const unsubscribe = useCallback(async (): Promise<PushResult> => {
        if (!enabled || !supported() || working.current)
            return {
                ok: false,
                message:
                    'Les notifications ne peuvent pas être modifiées maintenant.',
            };
        working.current = true;
        setIsLoading(true);
        setError(null);
        setNotice(null);
        let browserDisabled = false;
        try {
            const registration =
                registrationRef.current ?? (await readyWorker());
            const subscription =
                await registration.pushManager.getSubscription();
            if (subscription) {
                pendingRemoval.current = subscription.endpoint;
                setNeedsCleanup(true);
                if (!(await subscription.unsubscribe()))
                    throw new PushSetupError(
                        'Le navigateur n’a pas confirmé la désactivation. Réessaie ou utilise ses réglages.',
                    );
            }
            browserDisabled = true;
            setIsSubscribed(false);
            if (pendingRemoval.current) {
                await api('/push/unsubscribe', {
                    endpoint: pendingRemoval.current,
                });
                pendingRemoval.current = null;
                setNeedsCleanup(false);
            }
            const message = 'Notifications désactivées sur cet appareil.';
            setNotice(message);
            return { ok: true, message };
        } catch (caught) {
            const message = browserDisabled
                ? 'Notifications désactivées dans ce navigateur. La mise à jour du compte a échoué ; vérifie à nouveau une fois la connexion rétablie.'
                : messageOf(caught);
            setError(message);
            return { ok: false, message };
        } finally {
            working.current = false;
            if (active.current) setIsLoading(false);
        }
    }, [enabled]);

    return {
        permission,
        isSubscribed,
        isLoading,
        isChecking,
        isConfigured,
        needsCleanup,
        error,
        notice,
        subscribe,
        unsubscribe,
        checkAvailability,
    };
}
