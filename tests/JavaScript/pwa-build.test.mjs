import assert from 'node:assert/strict';
import {
    mkdirSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { buildPwaRevision } from '../../scripts/pwa-build.mjs';

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
