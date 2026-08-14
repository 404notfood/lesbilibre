import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import laravel from 'laravel-vite-plugin';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * HTTPS — résolution intelligente des certificats.
 *
 * Ordre de priorité :
 *   1. Variable d'env VITE_NO_HTTPS=1  → force HTTP (debug)
 *   2. Certs Laragon Windows           → dev local
 *   3. Certs Let's Encrypt Linux       → Docker / production
 *   4. Aucun cert trouvé               → HTTP (Vite démarre quand même)
 *
 * Ça évite le bug "PEM routines::no start line" sur Windows et le
 * "Mixed Content" quand on visite le site en HTTPS via Laragon mais
 * que Vite est en HTTP.
 */
function resolveHttps(): { cert: string; key: string } | undefined {
    if (process.env.VITE_NO_HTTPS === '1') {
        return undefined;
    }

    const candidates: { cert: string; key: string }[] = [
        // 1. Laragon Windows
        {
            cert: 'D:/Logiciel/laragon/etc/ssl/laragon.crt',
            key: 'D:/Logiciel/laragon/etc/ssl/laragon.key',
        },
        // 2. Let's Encrypt Linux/Docker
        {
            cert: '/etc/letsencrypt/live/lesbi.test/fullchain.pem',
            key: '/etc/letsencrypt/live/lesbi.test/privkey.pem',
        },
    ];

    for (const pair of candidates) {
        try {
            if (fs.existsSync(pair.cert) && fs.existsSync(pair.key)) {
                return pair;
            }
        } catch {
            // ignore (e.g. EPERM on Windows for /etc/* paths)
        }
    }

    return undefined;
}

const httpsConfig = resolveHttps();

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
        },
    },
    esbuild: {
        jsx: 'automatic',
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        ...(httpsConfig && { https: httpsConfig }),
        hmr: {
            host: 'lesbi.test',
            ...(httpsConfig && { protocol: 'wss' }),
        },
    },
});
