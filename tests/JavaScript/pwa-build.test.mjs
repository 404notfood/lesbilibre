import assert from 'node:assert/strict';
import {
    existsSync,
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build, loadConfigFromFile } from 'vite';
import { buildPwaRevision } from '../../scripts/pwa-build.mjs';

async function buildClient(root, extraPlugins = [], extraBuild = {}) {
    const loaded = await loadConfigFromFile(
        { command: 'build', mode: 'production' },
        fileURLToPath(new URL('../../vite.config.ts', import.meta.url)),
    );
    const plugin = loaded.config.plugins.find(
        (candidate) => candidate.name === 'lesbilibre-pwa-revision',
    );
    return build({
        root,
        configFile: false,
        publicDir: false,
        logLevel: 'silent',
        plugins: [...extraPlugins, plugin],
        build: {
            outDir: 'public/build',
            manifest: 'manifest.json',
            emptyOutDir: false,
            rollupOptions: { input: join(root, 'entry.js') },
            ...extraBuild,
        },
    });
}

function fixture(t) {
    const base = resolve(tmpdir());
    const root = mkdtempSync(join(base, 'lesbilibre-pwa-build-'));
    t.after(() => {
        assert.equal(dirname(resolve(root)), base);
        assert.ok(basename(root).startsWith('lesbilibre-pwa-build-'));
        rmSync(root, { recursive: true, force: true });
    });
    mkdirSync(join(root, 'public/images/branding'), { recursive: true });
    mkdirSync(join(root, 'public/build'), { recursive: true });
    writeFileSync(
        join(root, 'public/sw.js'),
        "const BUILD_REVISION = 'development';\nconst code = true;\n",
    );
    for (const file of [
        'manifest.json',
        'offline.html',
        'images/branding/icon-192.png',
        'images/branding/icon-48.png',
    ])
        writeFileSync(join(root, 'public', file), 'public fixture');
    const manifest = join(root, 'public/build/manifest.json');
    writeFileSync(manifest, '{"file":"app-12345678.js"}');
    return { root, manifest };
}

test('identical builds keep a deterministic worker revision', (t) => {
    const { root, manifest } = fixture(t);
    const first = buildPwaRevision(root, manifest);
    const source = readFileSync(join(root, 'public/sw.js'), 'utf8');
    assert.match(first, /^[a-f0-9]{16}$/);
    assert.equal(buildPwaRevision(root, manifest), first);
    assert.equal(readFileSync(join(root, 'public/sw.js'), 'utf8'), source);
});

test('a new application build or public offline screen changes the worker revision', (t) => {
    const { root, manifest } = fixture(t);
    const first = buildPwaRevision(root, manifest);
    writeFileSync(manifest, '{"file":"app-87654321.js"}');
    const second = buildPwaRevision(root, manifest);
    assert.notEqual(second, first);
    writeFileSync(join(root, 'public/offline.html'), 'new public fallback');
    assert.notEqual(buildPwaRevision(root, manifest), second);
});

test('a missing worker revision marker fails the build instead of leaving installations stale', (t) => {
    const { root, manifest } = fixture(t);
    writeFileSync(join(root, 'public/sw.js'), 'const missing = true;');
    assert.throws(
        () => buildPwaRevision(root, manifest),
        /Missing PWA revision marker/,
    );
});

test('a first client build writes its manifest before revising the worker', async (t) => {
    const { root, manifest } = fixture(t);
    rmSync(manifest);
    writeFileSync(join(root, 'entry.js'), 'console.log("client build");');
    await buildClient(root);
    assert.ok(existsSync(manifest));
    assert.match(
        readFileSync(join(root, 'public/sw.js'), 'utf8'),
        /BUILD_REVISION = '[a-f0-9]{16}'/,
    );
});

for (const previousManifest of [false, true]) {
    test(`a failed build preserves the original error and worker (previous manifest: ${previousManifest})`, async (t) => {
        const { root, manifest } = fixture(t);
        if (!previousManifest) rmSync(manifest);
        const worker = readFileSync(join(root, 'public/sw.js'), 'utf8');
        await assert.rejects(
            buildClient(root, [
                {
                    name: 'failing-prerequisite',
                    buildStart() {
                        this.error('Original prerequisite failure');
                    },
                },
            ]),
            /Original prerequisite failure/,
        );
        assert.equal(readFileSync(join(root, 'public/sw.js'), 'utf8'), worker);
        assert.equal(existsSync(manifest), previousManifest);
    });
}

test('an SSR build leaves the client worker revision unchanged', async (t) => {
    const { root } = fixture(t);
    const worker = readFileSync(join(root, 'public/sw.js'), 'utf8');
    writeFileSync(join(root, 'entry.js'), 'export const ssr = true;');
    await buildClient(root, [], {
        ssr: join(root, 'entry.js'),
        outDir: 'bootstrap/ssr',
        manifest: false,
    });
    assert.equal(readFileSync(join(root, 'public/sw.js'), 'utf8'), worker);
});
