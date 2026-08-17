const CACHE_PREFIX = 'lesbi-libre-';
const CACHE_NAME = `${CACHE_PREFIX}v4`;
const OFFLINE_URL = '/offline.html';

const BRAND_ICON = '/images/branding/icon-192.png';
const BRAND_BADGE = '/images/branding/icon-48.png';
const PRECACHE_URLS = [BRAND_ICON, BRAND_BADGE, OFFLINE_URL];

async function clearApplicationCaches() {
    const cacheNames = await caches.keys();

    await Promise.all(
        cacheNames
            .filter((name) => name.startsWith(CACHE_PREFIX))
            .map((name) => caches.delete(name)),
    );
}

async function restorePublicPrecache() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
}

self.addEventListener('install', (event) => {
    event.waitUntil(restorePublicPrecache());
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((cacheNames) =>
                Promise.all(
                    cacheNames
                        .filter(
                            (name) =>
                                name.startsWith(CACHE_PREFIX) &&
                                name !== CACHE_NAME,
                        )
                        .map((name) => caches.delete(name)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    // Les fichiers Vite portent un hash dans leur nom : ils peuvent être mis
    // en cache sans risque de servir une ancienne version de l'application.
    if (url.pathname.startsWith('/build/')) {
        event.respondWith(
            caches.match(event.request).then(async (cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                const networkResponse = await fetch(event.request);

                if (networkResponse.ok && networkResponse.type === 'basic') {
                    const cache = await caches.open(CACHE_NAME);
                    await cache.put(event.request, networkResponse.clone());
                }

                return networkResponse;
            }),
        );
        return;
    }

    // Toute navigation reste network-only afin de ne jamais conserver de page
    // Inertia authentifiée, de profil, de message ou de média privé. En cas de
    // coupure, l'écran hors-ligne fonctionne aussi depuis /dashboard.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(async () => {
                const offlineResponse = await caches.match(OFFLINE_URL);

                return (
                    offlineResponse ??
                    new Response('Vous êtes hors connexion.', {
                        status: 503,
                        headers: {
                            'Content-Type': 'text/plain; charset=utf-8',
                        },
                    })
                );
            }),
        );
    }
});

self.addEventListener('message', (event) => {
    if (event.data?.type === 'SKIP_WAITING') {
        self.skipWaiting();
        return;
    }

    // Une PWA peut rester ouverte après la déconnexion. On supprime uniquement
    // les caches LesbiLibre puis on remet les trois ressources publiques.
    if (event.data?.type === 'LOGOUT') {
        event.waitUntil(
            clearApplicationCaches().then(() => restorePublicPrecache()),
        );
    }
});

self.addEventListener('push', (event) => {
    let data = {
        title: 'LesbiLibre',
        body: 'Nouvelle notification',
        url: '/notifications',
    };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch {
            data.body = event.data.text();
        }
    }

    const options = {
        body: data.body,
        icon: BRAND_ICON,
        badge: BRAND_BADGE,
        tag: data.tag || 'default',
        data: { url: data.url || '/notifications' },
        vibrate: [200, 100, 200],
        actions: data.actions || [],
    };

    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const destination = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        self.clients
            .matchAll({ type: 'window', includeUncontrolled: true })
            .then(async (windowClients) => {
                for (const client of windowClients) {
                    if (new URL(client.url).origin === self.location.origin) {
                        await client.navigate(destination);
                        return client.focus();
                    }
                }

                return self.clients.openWindow(destination);
            }),
    );
});
