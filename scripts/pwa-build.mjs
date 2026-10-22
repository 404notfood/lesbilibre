import { createHash } from 'node:crypto';
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/** Give existing installations a new worker whenever their client build changes. */
export function buildPwaRevision(root, manifestPath) {
    const workerPath = resolve(root, 'public/sw.js');
    const worker = readFileSync(workerPath, 'utf8').replace(/\r\n/g, '\n');
    const marker = /const BUILD_REVISION = '[^']*';/;
    if (!marker.test(worker)) throw new Error('Missing PWA revision marker.');
    const hash = createHash('sha256');
    hash.update(worker.replace(marker, "const BUILD_REVISION = 'revision';"));
    for (const file of [
        manifestPath,
        resolve(root, 'public/manifest.json'),
        resolve(root, 'public/offline.html'),
        resolve(root, 'public/images/branding/icon-192.png'),
        resolve(root, 'public/images/branding/icon-48.png'),
    ]) {
        hash.update(readFileSync(file));
    }
    const revision = hash.digest('hex').slice(0, 16);
    const generated = worker.replace(
        marker,
        `const BUILD_REVISION = '${revision}';`,
    );
    if (generated !== worker) {
        writeFileSync(workerPath + '.tmp', generated);
        renameSync(workerPath + '.tmp', workerPath);
    }
    return revision;
}
