import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import { setImmediate } from 'node:timers';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const compiledHook = ts.transpileModule(
    fs.readFileSync(
        new URL(
            '../../resources/js/hooks/use-push-notifications.ts',
            import.meta.url,
        ),
        'utf8',
    ),
    {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2022,
        },
    },
).outputText;
const fakePublicKey = Buffer.from([4, ...Array(64).fill(1)]).toString(
    'base64url',
);

// Exercise the real hook's effects and callbacks in an isolated browser API
// model. No permission UI, service worker, account or network is contacted.
function harness(options = {}) {
    const calls = { permission: 0, subscribe: 0, unsubscribe: 0, requests: [] };
    const slots = [];
    let cursor = 0;
    let effects = [];
    let subscription = null;
    const makeSubscription = () => ({
        endpoint: 'https://fcm.googleapis.com/push/synthetic-browser',
        toJSON() {
            return {
                endpoint: this.endpoint,
                keys: {
                    p256dh: 'synthetic-public-key',
                    auth: 'synthetic-auth',
                },
            };
        },
        async unsubscribe() {
            calls.unsubscribe += 1;
            subscription = null;
            return true;
        },
    });
    if (options.existingSubscription) subscription = makeSubscription();
    const react = {
        useState(initial) {
            const id = cursor++;
            if (!(id in slots))
                slots[id] = typeof initial === 'function' ? initial() : initial;
            return [
                slots[id],
                (next) => {
                    slots[id] =
                        typeof next === 'function' ? next(slots[id]) : next;
                },
            ];
        },
        useRef(initial) {
            const id = cursor++;
            if (!(id in slots)) slots[id] = { current: initial };
            return slots[id];
        },
        useCallback(callback, dependencies) {
            const id = cursor++;
            const previous = slots[id];
            if (
                !previous ||
                dependencies.some(
                    (value, index) => value !== previous.dependencies[index],
                )
            )
                slots[id] = { callback, dependencies };
            return slots[id].callback;
        },
        useEffect(effect, dependencies) {
            const id = cursor++;
            const previous = slots[id];
            if (
                !previous ||
                dependencies.some(
                    (value, index) => value !== previous.dependencies[index],
                )
            ) {
                effects.push(() => {
                    previous?.cleanup?.();
                    slots[id] = { dependencies, cleanup: effect() };
                });
            }
        },
    };
    const notification = {
        permission: options.permission ?? 'default',
        async requestPermission() {
            calls.permission += 1;
            notification.permission = 'granted';
            return 'granted';
        },
    };
    class PushManagerMock {
        static supportedContentEncodings = ['aes128gcm'];
    }
    const registration = {
        pushManager: {
            async getSubscription() {
                return subscription;
            },
            async subscribe() {
                calls.subscribe += 1;
                subscription = makeSubscription();
                return subscription;
            },
        },
    };
    const navigatorMock = {
        onLine: true,
        userAgent: options.ios
            ? 'Synthetic iPhone'
            : 'Synthetic desktop browser',
        platform: options.ios ? 'iPhone' : 'Win32',
        maxTouchPoints: options.ios ? 5 : 0,
        serviceWorker: {
            ready: options.workerNeverReady
                ? new Promise(() => {})
                : Promise.resolve(registration),
        },
    };
    const windowMock = {
        isSecureContext: options.secure ?? true,
        Notification: notification,
        PushManager: PushManagerMock,
        matchMedia: () => ({ matches: options.standalone ?? false }),
        atob: (value) => Buffer.from(value, 'base64').toString('binary'),
        addEventListener() {},
        removeEventListener() {},
    };
    const module = { exports: {} };
    const context = {
        module,
        exports: module.exports,
        require: (specifier) => {
            assert.equal(specifier, 'react');
            return react;
        },
        window: windowMock,
        navigator: navigatorMock,
        document: {
            querySelector: () => ({ content: 'synthetic-csrf-token' }),
        },
        Notification: notification,
        PushManager: PushManagerMock,
        AbortController,
        setTimeout: (callback, milliseconds) =>
            setTimeout(
                callback,
                options.fastTimers ? Math.min(milliseconds, 5) : milliseconds,
            ),
        clearTimeout,
        async fetch(url, init) {
            calls.requests.push({ url, method: init.method });
            if (url === '/push/vapid-key')
                return new Response(
                    JSON.stringify({
                        publicKey:
                            options.publicKey === undefined
                                ? fakePublicKey
                                : options.publicKey,
                    }),
                    { status: options.keyStatus ?? 200 },
                );
            if (url === '/push/subscribe')
                return new Response('{}', {
                    status: options.subscribeStatus ?? 200,
                });
            if (url === '/push/unsubscribe')
                return new Response('{}', { status: 200 });
            throw new Error('Unexpected synthetic request.');
        },
    };
    vm.runInNewContext(compiledHook, context);
    const render = () => {
        cursor = 0;
        const value = module.exports.usePushNotifications();
        const pending = effects;
        effects = [];
        pending.forEach((effect) => effect());
        return value;
    };
    render();
    return {
        calls,
        render,
        async settle() {
            for (let index = 0; index < 5; index += 1)
                await new Promise(setImmediate);
            return render();
        },
        cleanup() {
            slots.forEach((slot) => slot?.cleanup?.());
        },
    };
}

test('mount checks availability without asking permission or subscribing', async () => {
    const browser = harness();
    try {
        const state = await browser.settle();
        assert.equal(state.isConfigured, true);
        assert.equal(state.isSubscribed, false);
        assert.equal(browser.calls.permission, 0);
        assert.equal(browser.calls.subscribe, 0);
        assert.deepEqual(browser.calls.requests, [
            { url: '/push/vapid-key', method: 'GET' },
        ]);
    } finally {
        browser.cleanup();
    }
});

test('HTTP 422 during explicit activation revokes the browser subscription and reports failure', async () => {
    const browser = harness({ subscribeStatus: 422 });
    try {
        let state = await browser.settle();
        const result = await state.subscribe();
        state = browser.render();
        assert.equal(result.ok, false);
        assert.equal(browser.calls.permission, 1);
        assert.equal(browser.calls.subscribe, 1);
        assert.equal(browser.calls.unsubscribe, 1);
        assert.equal(state.isSubscribed, false);
        assert.match(state.error, /appareil.*enregistré/i);
        assert.doesNotMatch(
            state.error,
            /fcm|synthetic-public-key|synthetic-auth/,
        );
    } finally {
        browser.cleanup();
    }
});

test('successful explicit activation is confirmed only after the server accepts it', async () => {
    const browser = harness();
    try {
        let state = await browser.settle();
        assert.equal((await state.subscribe()).ok, true);
        state = browser.render();
        assert.equal(state.isSubscribed, true);
        assert.equal(browser.calls.permission, 1);
        assert.equal(browser.calls.unsubscribe, 0);
    } finally {
        browser.cleanup();
    }
});

test('missing public configuration prevents requesting notification permission', async () => {
    const browser = harness({ publicKey: null });
    try {
        const state = await browser.settle();
        assert.equal(state.isConfigured, false);
        assert.equal((await state.subscribe()).ok, false);
        assert.equal(browser.calls.permission, 0);
        assert.equal(browser.calls.subscribe, 0);
    } finally {
        browser.cleanup();
    }
});

test('existing device notifications can be disabled when VAPID configuration is missing', async () => {
    const browser = harness({
        permission: 'granted',
        existingSubscription: true,
        publicKey: null,
    });
    try {
        let state = await browser.settle();
        assert.equal(state.isConfigured, false);
        assert.equal(state.isSubscribed, true);
        assert.equal((await state.unsubscribe()).ok, true);
        state = browser.render();
        assert.equal(state.isSubscribed, false);
        assert.equal(browser.calls.unsubscribe, 1);
        assert.equal(browser.calls.permission, 0);
        assert.ok(
            browser.calls.requests.some(
                (request) => request.url === '/push/unsubscribe',
            ),
        );
    } finally {
        browser.cleanup();
    }
});

test('insecure contexts do not fetch push configuration or request permission', async () => {
    const browser = harness({ secure: false });
    try {
        const state = await browser.settle();
        assert.equal(state.permission, 'unsupported');
        assert.equal((await state.subscribe()).ok, false);
        assert.equal(browser.calls.permission, 0);
        assert.equal(browser.calls.requests.length, 0);
    } finally {
        browser.cleanup();
    }
});

test('iOS requires the installed window before offering push', async () => {
    const browser = harness({ ios: true });
    try {
        const state = await browser.settle();
        assert.equal(state.permission, 'unsupported');
        assert.equal(browser.calls.requests.length, 0);
        assert.equal(browser.calls.permission, 0);
    } finally {
        browser.cleanup();
    }
});

test('a service worker that never becomes ready ends in a retryable state', async () => {
    const browser = harness({ workerNeverReady: true, fastTimers: true });
    try {
        await new Promise((resolve) => setTimeout(resolve, 20));
        const state = await browser.settle();
        assert.equal(state.isChecking, false);
        assert.equal(state.isConfigured, false);
        assert.match(state.error, /pas encore prête/);
        assert.equal(browser.calls.permission, 0);
    } finally {
        browser.cleanup();
    }
});
