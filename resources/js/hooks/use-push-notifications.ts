import { useCallback, useEffect, useState } from 'react';

type PushPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const [permission, setPermission] = useState<PushPermissionState>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
            setPermission('unsupported');
            return;
        }

        setPermission(Notification.permission as PushPermissionState);

        navigator.serviceWorker.register('/sw.js').then((registration) => {
            registration.pushManager.getSubscription().then((subscription) => {
                setIsSubscribed(!!subscription);
            });
        });
    }, []);

    const subscribe = useCallback(async () => {
        if (permission === 'unsupported') {
            return;
        }

        setIsLoading(true);

        try {
            const result = await Notification.requestPermission();
            setPermission(result as PushPermissionState);

            if (result !== 'granted') {
                return;
            }

            const registration = await navigator.serviceWorker.ready;

            const response = await fetch('/push/vapid-key');
            const { publicKey } = await response.json();

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
            });

            const subscriptionJson = subscription.toJSON();

            await fetch('/push/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    endpoint: subscriptionJson.endpoint,
                    keys: {
                        p256dh: subscriptionJson.keys?.p256dh,
                        auth: subscriptionJson.keys?.auth,
                    },
                    contentEncoding: (PushManager.supportedContentEncodings || ['aesgcm'])[0],
                }),
            });

            setIsSubscribed(true);
        } catch (error) {
            console.error('Push subscription failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, [permission]);

    const unsubscribe = useCallback(async () => {
        setIsLoading(true);

        try {
            const registration = await navigator.serviceWorker.ready;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                await fetch('/push/unsubscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });

                await subscription.unsubscribe();
            }

            setIsSubscribed(false);
        } catch (error) {
            console.error('Push unsubscription failed:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { permission, isSubscribed, isLoading, subscribe, unsubscribe };
}
