// Replaced deterministically by the Vite PWA plugin after each client build.
const BUILD_REVISION = '4c6d252bd2a9372a';
const CACHE_PREFIX = 'lesbi-libre-';
const CACHE_NAME = `${CACHE_PREFIX}v5-${BUILD_REVISION}`;
const OFFLINE_URL = '/offline.html';
const BRAND_ICON = '/images/branding/icon-192.png';
const BRAND_BADGE = '/images/branding/icon-48.png';
const PRECACHE_URLS = [BRAND_ICON, BRAND_BADGE, OFFLINE_URL];

async function clearApplicationCaches(keepCurrent = false) {
    const names = await caches.keys();
    await Promise.all(
        names
            .filter(
                (name) =>
                    name.startsWith(CACHE_PREFIX) &&
                    (!keepCurrent || name !== CACHE_NAME),
            )
            .map((name) => caches.delete(name)),
    );
}

async function restorePublicPrecache() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(
        PRECACHE_URLS.map(
            (url) => new Request(url, { credentials: 'omit', cache: 'reload' }),
        ),
    );
}

function trustedClientMessage(event) {
    try {
        return (
            typeof event.source?.url === 'string' &&
            new URL(event.source.url).origin === self.location.origin &&
            (!event.origin || event.origin === self.location.origin)
        );
    } catch {
        return false;
    }
}

function publicAssetRequest(request, url) {
    return (
        url.search === '' &&
        url.hash === '' &&
        /^\/build\/assets\/[A-Za-z0-9_.-]+-[A-Za-z0-9_-]{8,}\.(?:js|css|woff2?|ttf|otf|png|jpe?g|webp|avif|svg|ico)$/i.test(
            url.pathname,
        ) &&
        !request.headers.has('Range') &&
        !request.headers.has('Authorization') &&
        !request.headers.has('X-Inertia') &&
        request.cache !== 'no-store'
    );
}

function cacheableAssetResponse(response) {
    const policy = response.headers.get('Cache-Control') || '';
    const mime = (response.headers.get('Content-Type') || '')
        .split(';')[0]
        .trim()
        .toLowerCase();
    return (
        response.status === 200 &&
        response.type === 'basic' &&
        !response.redirected &&
        !/(?:^|,)\s*(?:private|no-store)\b/i.test(policy) &&
        /^(?:(?:text|application)\/(?:javascript|x-javascript)|text\/css|font\/(?:woff2?|ttf|otf)|application\/(?:font-woff|vnd\.ms-fontobject)|image\/(?:png|jpeg|webp|avif|svg\+xml|x-icon|vnd\.microsoft\.icon))$/.test(
            mime,
        )
    );
}

function notificationDestination(value) {
    try {
        if (typeof value !== 'string' || /[\\\x00-\x20]/.test(value))
            return '/notifications';
        const url = new URL(value, self.location.origin);
        if (
            url.origin !== self.location.origin ||
            url.username ||
            url.password ||
            url.search ||
            url.hash
        )
            return '/notifications';
        if (
            !/^\/(?:notifications|matches|likes\/received|gallery-access|conversations(?:\/[1-9]\d*)?)\/?$/.test(
                url.pathname,
            )
        )
            return '/notifications';
        return url.pathname;
    } catch {
        return '/notifications';
    }
}

self.addEventListener('install', (event) =>
    event.waitUntil(restorePublicPrecache()),
);
self.addEventListener('activate', (event) =>
    event.waitUntil(
        clearApplicationCaches(true).then(() => self.clients.claim()),
    ),
);

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);
    if (request.method !== 'GET' || url.origin !== self.location.origin) return;

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request, { cache: 'no-store' }).catch(async () => {
                const cache = await caches.open(CACHE_NAME);
                return (
                    (await cache.match(OFFLINE_URL)) ||
                    new Response(
                        'Connexion indisponible. Aucun contenu personnel n’est disponible hors ligne.',
                        {
                            status: 503,
                            headers: {
                                'Content-Type': 'text/plain; charset=utf-8',
                                'Cache-Control': 'no-store',
                            },
                        },
                    )
                );
            }),
        );
        return;
    }

    if (!publicAssetRequest(request, url)) return;
    event.respondWith(
        (async () => {
            const cache = await caches.open(CACHE_NAME);
            const cached = await cache.match(request);
            if (cached && cacheableAssetResponse(cached)) return cached;
            const response = await fetch(request);
            if (cacheableAssetResponse(response)) {
                // A quota failure must not break a successful network response.
                try {
                    await cache.put(request, response.clone());
                } catch {
                    /* Network response remains usable. */
                }
            }
            return response;
        })(),
    );
});

self.addEventListener('message', (event) => {
    if (!trustedClientMessage(event)) return;
    if (event.data?.type === 'SKIP_WAITING') {
        event.waitUntil(Promise.resolve(self.skipWaiting()));
    } else if (event.data?.type === 'LOGOUT') {
        event.waitUntil(
            (async () => {
                await clearApplicationCaches();
                const cleanup = [restorePublicPrecache()];
                cleanup.push(
                    (async () => {
                        const notifications =
                            await self.registration.getNotifications();
                        notifications.forEach((notification) =>
                            notification.close(),
                        );
                    })(),
                );
                if (self.registration.pushManager) {
                    cleanup.push(
                        (async () => {
                            const subscription =
                                await self.registration.pushManager.getSubscription();
                            if (subscription) await subscription.unsubscribe();
                        })(),
                    );
                }
                cleanup.push(
                    (async () => {
                        const clients = await self.clients.matchAll({
                            type: 'window',
                            includeUncontrolled: true,
                        });
                        for (const client of clients) {
                            if (
                                client.id !== event.source.id &&
                                new URL(client.url).origin ===
                                    self.location.origin
                            )
                                client.postMessage({ type: 'SESSION_ENDED' });
                        }
                    })(),
                );
                await Promise.allSettled(cleanup);
            })(),
        );
    }
});

self.addEventListener('push', (event) => {
    let payload = {};
    try {
        payload = event.data?.json() || {};
    } catch {
        /* Never display raw push text. */
    }
    // Defense in depth: no message, email or identity on the lock screen.
    const options = {
        body: 'Une nouvelle activité vous attend dans l’application.',
        icon: BRAND_ICON,
        badge: BRAND_BADGE,
        tag: 'lesbilibre-activity',
        data: { url: notificationDestination(payload?.url) },
    };
    event.waitUntil(self.registration.showNotification('LesbiLibre', options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const destination = notificationDestination(event.notification.data?.url);
    event.waitUntil(
        (async () => {
            const clients = await self.clients.matchAll({
                type: 'window',
                includeUncontrolled: true,
            });
            for (const client of clients) {
                const current = new URL(client.url);
                if (
                    current.origin === self.location.origin &&
                    current.pathname === destination &&
                    !current.search &&
                    !current.hash
                )
                    return client.focus();
            }
            // Do not navigate another conversation away from an unsent draft.
            return self.clients.openWindow(destination);
        })(),
    );
});
