const CACHE_NAME = 'lesbi-libre-v3';
const OFFLINE_URL = '/offline.html';

const BRAND_ICON = '/images/branding/icon-192.png';
const BRAND_BADGE = '/images/branding/icon-48.png';

const PRECACHE_URLS = [
    BRAND_ICON,
    BRAND_BADGE,
    OFFLINE_URL,
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Never cache navigations, APIs, uploads or the authenticated app. Dating
    // content is personal and can include private photos and conversations.
    if (event.request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    // Le manifeste et les icônes de marque sont volontairement exclus du cache :
    // ils changent avec le branding et un cache figé fait réapparaître l'ancien
    // logo dans l'icône d'installation.
    const isPublicAsset = url.pathname.startsWith('/build/');

    if (isPublicAsset) {
        event.respondWith(
            caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
                return response;
            }))
        );
        return;
    }

    if (event.request.mode === 'navigate' && url.pathname === '/') {
        event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_URL)));
    }
});

// Purge déclenchée par l'application au moment de la déconnexion : en PWA la
// fenêtre survit à la session, il ne doit rien rester en cache.
self.addEventListener('message', (event) => {
    if (event.data?.type !== 'LOGOUT') {
        return;
    }

    event.waitUntil(
        caches.keys()
            .then((names) => Promise.all(names.map((name) => caches.delete(name))))
            .then(() => caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)))
    );
});

self.addEventListener('push', (event) => {
    let data = { title: 'LesbiLibre', body: 'Nouvelle notification', url: '/notifications' };

    if (event.data) {
        try {
            data = { ...data, ...event.data.json() };
        } catch (e) {
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

    const url = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            for (const client of clients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(url);
                    return client.focus();
                }
            }
            return self.clients.openWindow(url);
        })
    );
});
