import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import vm from 'node:vm';

const workerSource = await readFile(
    new URL('../../public/sw.js', import.meta.url),
    'utf8',
);
const origin = 'https://pwa.example.test';
const absolute = (input) =>
    new URL(typeof input === 'string' ? input : input.url, origin).href;
const asset = '/build/assets/app-Ab12Cd34.js';

function response(body = 'public asset', overrides = {}) {
    const data = {
        status: 200,
        type: 'basic',
        redirected: false,
        url: `${origin}${asset}`,
        headers: new Headers({
            'Content-Type': 'application/javascript',
            ...overrides.headers,
        }),
        ...overrides,
    };
    data.headers = new Headers(data.headers);
    return {
        ...data,
        ok: data.status >= 200 && data.status < 300,
        text: async () => body,
        clone: () => response(body, data),
    };
}

function setup() {
    const listeners = new Map();
    const stores = new Map();
    const calls = {
        fetch: [],
        puts: [],
        globalMatches: [],
        opened: [],
        shown: [],
        closed: 0,
        claimed: 0,
        skipped: 0,
        unsubscribed: 0,
    };
    const windows = [];
    let fetchImpl = async () => response();
    let cacheWritesFail = false;
    let precacheReloadFails = false;
    const key = absolute;
    const cacheFor = (name) => {
        if (!stores.has(name)) stores.set(name, new Map());
        const store = stores.get(name);
        return {
            match: async (request) => store.get(key(request)),
            put: async (request, result) => {
                if (cacheWritesFail)
                    throw new Error('synthetic quota exceeded');
                calls.puts.push({ name, url: key(request) });
                store.set(key(request), result);
            },
            addAll: async (requests) => {
                if (precacheReloadFails)
                    throw new TypeError('offline public precache');
                for (const request of requests)
                    store.set(
                        key(request),
                        response(`precache:${key(request)}`, {
                            headers: {
                                'Content-Type': key(request).endsWith('.html')
                                    ? 'text/html'
                                    : 'image/png',
                            },
                        }),
                    );
            },
            keys: async () => [...store.keys()].map((url) => ({ url })),
            delete: async (request) => store.delete(key(request)),
        };
    };
    class WorkerRequest {
        constructor(input, options = {}) {
            Object.assign(
                this,
                typeof input === 'object' ? input : {},
                options,
            );
            this.url = absolute(input);
            this.method ??= 'GET';
            this.mode ??= 'cors';
            this.cache ??= 'default';
            this.headers = new Headers(options.headers ?? input.headers ?? {});
        }
        clone() {
            return new WorkerRequest(this);
        }
    }
    const caches = {
        open: async (name) => cacheFor(name),
        keys: async () => [...stores.keys()],
        delete: async (name) => stores.delete(name),
        match: async (request) => {
            calls.globalMatches.push(key(request));
            for (const store of stores.values())
                if (store.has(key(request))) return store.get(key(request));
        },
    };
    const self = {
        location: new URL(`${origin}/sw.js`),
        addEventListener: (type, listener) => listeners.set(type, listener),
        skipWaiting: async () => {
            calls.skipped++;
        },
        registration: {
            scope: `${origin}/`,
            showNotification: async (title, options) => {
                calls.shown.push({ title, ...options });
            },
            getNotifications: async () => [
                {
                    close: () => {
                        calls.closed++;
                    },
                },
            ],
            pushManager: {
                getSubscription: async () => ({
                    unsubscribe: async () => {
                        calls.unsubscribed++;
                        return true;
                    },
                }),
            },
        },
        clients: {
            claim: async () => {
                calls.claimed++;
            },
            matchAll: async () => windows,
            get: async (id) => windows.find((client) => client.id === id),
            openWindow: async (url) => {
                calls.opened.push(absolute(url));
                return null;
            },
        },
    };
    const context = vm.createContext({
        self,
        caches,
        URL,
        Request: WorkerRequest,
        Response,
        Headers,
        console,
        fetch: async (request, options) => {
            calls.fetch.push({ request, options });
            return fetchImpl(request, options);
        },
    });
    vm.runInContext(workerSource, context, { filename: 'public/sw.js' });
    async function dispatch(type, fields = {}) {
        const jobs = [];
        let result;
        let intercepted = false;
        const event = {
            ...fields,
            waitUntil: (job) => jobs.push(Promise.resolve(job)),
            respondWith: (job) => {
                intercepted = true;
                result = Promise.resolve(job);
            },
        };
        listeners.get(type)?.(event);
        if (result) result = await result;
        await Promise.all(jobs);
        return { response: result, intercepted };
    }
    return {
        calls,
        stores,
        windows,
        cacheFor,
        dispatch,
        request: (url, options) => new WorkerRequest(url, options),
        setFetch: (handler) => {
            fetchImpl = handler;
        },
        failCacheWrites: () => {
            cacheWritesFail = true;
        },
        failPrecacheReload: () => {
            precacheReloadFails = true;
        },
        currentCache: async () => {
            await dispatch('install');
            return [...stores.keys()].find((name) =>
                name.startsWith('lesbi-libre-'),
            );
        },
        trustedMessage: async (type) => {
            const source = {
                id: 'trusted-tab',
                url: `${origin}/dashboard`,
                type: 'window',
            };
            windows.push(source);
            return dispatch('message', { origin, source, data: { type } });
        },
    };
}

test('install precaches exactly the public fallback and branding without forcing an update', async () => {
    const sw = setup();
    const name = await sw.currentCache();
    assert.deepEqual(
        [...sw.stores.get(name).keys()].sort(),
        [
            '/offline.html',
            '/images/branding/icon-192.png',
            '/images/branding/icon-48.png',
        ]
            .map(absolute)
            .sort(),
    );
    assert.equal(sw.calls.skipped, 0);
});

test('activation removes obsolete application caches and retains unrelated caches', async () => {
    const sw = setup();
    const current = await sw.currentCache();
    sw.stores.set(
        'lesbi-libre-obsolete',
        new Map([[`${origin}/dashboard`, response('private obsolete page')]]),
    );
    sw.stores.set('another-app', new Map());
    await sw.dispatch('activate');
    assert.deepEqual(
        [...sw.stores.keys()].sort(),
        [current, 'another-app'].sort(),
    );
    assert.equal(sw.calls.claimed, 1);
});

test('fingerprinted local assets are cached in the current namespace only', async () => {
    const sw = setup();
    await sw.currentCache();
    const request = sw.request(asset);
    await sw.dispatch('fetch', { request });
    await sw.dispatch('fetch', { request });
    assert.equal(sw.calls.fetch.length, 1);
    assert.equal(sw.calls.puts.length, 1);
    assert.deepEqual(sw.calls.globalMatches, []);
});

test('private, foreign, mutable, authenticated, partial and non-GET requests bypass the worker cache', async () => {
    const sw = setup();
    await sw.currentCache();
    const requests = [
        sw.request('/conversations/7/messages/sync'),
        sw.request('/photos/12/file'),
        sw.request('/ephemeral/12/file'),
        sw.request(`https://foreign.example.test${asset}`),
        sw.request('/build/manifest.json'),
        sw.request('/build/assets/app.js'),
        sw.request(`${asset}?account=7`),
        sw.request(asset, { method: 'POST' }),
        sw.request(asset, { cache: 'no-store' }),
        sw.request(asset, { headers: { Range: 'bytes=0-99' } }),
        sw.request(asset, { headers: { Authorization: 'Bearer synthetic' } }),
        sw.request(asset, { headers: { 'X-Inertia': 'true' } }),
    ];
    for (const request of requests) {
        const result = await sw.dispatch('fetch', { request });
        assert.equal(result.intercepted, false, request.url);
    }
    assert.equal(sw.calls.puts.length, 0);
});

test('unsafe asset responses are never written to the application cache', async () => {
    for (const overrides of [
        { status: 500 },
        { status: 206 },
        { type: 'opaque' },
        { redirected: true },
        { headers: { 'Content-Type': 'text/html' } },
        {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'private, max-age=60',
            },
        },
        {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'no-store',
            },
        },
    ]) {
        const sw = setup();
        await sw.currentCache();
        sw.setFetch(async () => response('never cache this', overrides));
        await sw.dispatch('fetch', { request: sw.request(asset) });
        assert.equal(sw.calls.puts.length, 0, JSON.stringify(overrides));
    }
});

test('a full browser cache does not turn a successful asset download into an application error', async () => {
    const sw = setup();
    await sw.currentCache();
    sw.failCacheWrites();
    const result = await sw.dispatch('fetch', { request: sw.request(asset) });
    assert.equal(result.response.status, 200);
    assert.equal(await result.response.text(), 'public asset');
});

test('an unsafe response already present in the current cache is ignored', async () => {
    const sw = setup();
    const name = await sw.currentCache();
    sw.stores
        .get(name)
        .set(
            `${origin}${asset}`,
            response('private old content', {
                headers: {
                    'Content-Type': 'text/html',
                    'Cache-Control': 'private',
                },
            }),
        );
    const result = await sw.dispatch('fetch', { request: sw.request(asset) });
    assert.equal(await result.response.text(), 'public asset');
    assert.equal(sw.calls.fetch.length, 1);
});

test('navigation always reaches the network with no-store and never reuses old private pages', async () => {
    const sw = setup();
    await sw.currentCache();
    sw.stores.set(
        'lesbi-libre-obsolete',
        new Map([[`${origin}/dashboard`, response('old private page')]]),
    );
    sw.setFetch(async () =>
        response('fresh page', { headers: { 'Content-Type': 'text/html' } }),
    );
    const result = await sw.dispatch('fetch', {
        request: sw.request('/dashboard', { mode: 'navigate' }),
    });
    assert.equal(await result.response.text(), 'fresh page');
    assert.equal(
        sw.calls.fetch[0].options?.cache ?? sw.calls.fetch[0].request.cache,
        'no-store',
    );
    assert.equal(sw.calls.puts.length, 0);
    assert.deepEqual(sw.calls.globalMatches, []);
});

test('offline navigation returns only the current public fallback, never a cached member page', async () => {
    const sw = setup();
    await sw.currentCache();
    sw.stores.set(
        'another-app',
        new Map([[`${origin}/offline.html`, response('foreign cache')]]),
    );
    sw.stores.set(
        'lesbi-libre-obsolete',
        new Map([
            [`${origin}/conversations/7`, response('private old messages')],
        ]),
    );
    sw.setFetch(async () => {
        throw new TypeError('offline');
    });
    const result = await sw.dispatch('fetch', {
        request: sw.request('/conversations/7', { mode: 'navigate' }),
    });
    assert.equal(
        await result.response.text(),
        `precache:${origin}/offline.html`,
    );
    assert.deepEqual(sw.calls.globalMatches, []);
});

test('offline navigation has a safe 503 when no precache is available', async () => {
    const sw = setup();
    sw.setFetch(async () => {
        throw new TypeError('offline');
    });
    const result = await sw.dispatch('fetch', {
        request: sw.request('/dashboard', { mode: 'navigate' }),
    });
    assert.equal(result.response.status, 503);
    assert.match(await result.response.text(), /hors (connexion|ligne)/i);
});

test('worker updates require an explicit message from a same-origin window', async () => {
    const sw = setup();
    await sw.dispatch('message', { data: { type: 'SKIP_WAITING' } });
    await sw.dispatch('message', {
        origin: 'https://foreign.example.test',
        source: { url: 'https://foreign.example.test/', type: 'window' },
        data: { type: 'SKIP_WAITING' },
    });
    assert.equal(sw.calls.skipped, 0);
    await sw.trustedMessage('SKIP_WAITING');
    assert.equal(sw.calls.skipped, 1);
});

test('logout clears application caches, notifications and push subscription, retaining only public precache', async () => {
    const sw = setup();
    const current = await sw.currentCache();
    sw.stores.get(current).set(`${origin}${asset}`, response());
    sw.stores.set('lesbi-libre-obsolete', new Map());
    sw.stores.set('another-app', new Map());
    await sw.trustedMessage('LOGOUT');
    assert.deepEqual(
        [...sw.stores.keys()].sort(),
        [current, 'another-app'].sort(),
    );
    assert.equal(sw.stores.get(current).size, 3);
    assert.equal(sw.calls.closed, 1);
    assert.equal(sw.calls.unsubscribed, 1);
});

test('foreign logout messages cannot erase the local application state', async () => {
    const sw = setup();
    await sw.currentCache();
    await sw.dispatch('message', {
        origin: 'https://foreign.example.test',
        source: { url: 'https://foreign.example.test/' },
        data: { type: 'LOGOUT' },
    });
    assert.equal(sw.calls.unsubscribed, 0);
    assert.equal(sw.calls.closed, 0);
});

test('logout still closes notifications and unsubscribes offline, and only warns other local tabs', async () => {
    const sw = setup();
    await sw.currentCache();
    const messages = [];
    sw.windows.push({
        id: 'other-local-tab',
        url: `${origin}/conversations/27`,
        postMessage: (data) => messages.push({ target: 'local', ...data }),
    });
    sw.windows.push({
        id: 'foreign-tab',
        url: 'https://foreign.example.test/',
        postMessage: (data) => messages.push({ target: 'foreign', ...data }),
    });
    sw.failPrecacheReload();
    await sw.trustedMessage('LOGOUT');
    assert.equal(sw.calls.closed, 1);
    assert.equal(sw.calls.unsubscribed, 1);
    assert.deepEqual(messages, [{ target: 'local', type: 'SESSION_ENDED' }]);
});

test('push payload content and actions are replaced by a generic private notification', async () => {
    const sw = setup();
    await sw.dispatch('push', {
        data: {
            json: () => ({
                title: 'Private member identity',
                body: 'Secret email private@example.com',
                actions: [{ action: 'leak', title: 'Private action' }],
                url: '/conversations/27',
            }),
        },
    });
    const notification = sw.calls.shown[0];
    assert.equal(notification.title, 'LesbiLibre');
    assert.doesNotMatch(
        JSON.stringify(notification),
        /Private|Secret|private@example.com|leak/,
    );
    assert.equal(absolute(notification.data.url), `${origin}/conversations/27`);
    assert.equal(notification.actions?.length ?? 0, 0);
    await sw.dispatch('push', {
        data: {
            json: () => {
                throw new SyntaxError('invalid JSON');
            },
            text: () => 'raw private content',
        },
    });
    assert.doesNotMatch(
        JSON.stringify(sw.calls.shown.at(-1)),
        /raw private content/,
    );
});

test('notification click rejects unsafe origins, schemes and paths', async () => {
    for (const url of [
        'https://evil.example.test/',
        '//evil.example.test/',
        'javascript:alert(1)',
        '/admin/users',
        '/logout',
        '/conversations/27?next=https://evil.example.test/',
    ]) {
        const sw = setup();
        await sw.dispatch('notificationclick', {
            notification: { data: { url }, close() {} },
        });
        assert.equal(sw.calls.opened.length, 1, url);
        assert.equal(sw.calls.opened[0], `${origin}/notifications`, url);
    }
});

test('notification click focuses an exact existing target and preserves other tabs with unsaved forms', async () => {
    const sw = setup();
    let focused = 0;
    let navigated = 0;
    sw.windows.push({
        id: 'draft',
        url: `${origin}/profile/edit`,
        focus: async () => {
            focused++;
        },
        navigate: async () => {
            navigated++;
        },
    });
    await sw.dispatch('notificationclick', {
        notification: { data: { url: '/conversations/27' }, close() {} },
    });
    assert.equal(navigated, 0);
    assert.equal(focused, 0);
    assert.deepEqual(sw.calls.opened, [`${origin}/conversations/27`]);
    sw.windows.push({
        id: 'target',
        url: `${origin}/conversations/27`,
        focus: async () => {
            focused++;
        },
        navigate: async () => {
            navigated++;
        },
    });
    await sw.dispatch('notificationclick', {
        notification: { data: { url: '/conversations/27' }, close() {} },
    });
    assert.equal(navigated, 0);
    assert.equal(focused, 1);
    assert.equal(sw.calls.opened.length, 1);
});
