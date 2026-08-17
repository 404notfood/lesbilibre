/* eslint-env node */
const fs = require('node:fs');
const path = require('node:path');

const envPath = path.join(__dirname, '.env');
const envContents = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, 'utf8')
    : '';
const localSoketiBin = path.join(
    process.env.HOME || '',
    '.local',
    'bin',
    'soketi',
);

/** Lit uniquement les valeurs simples necessaires a Soketi dans le .env Laravel. */
function envValue(name, fallback = '') {
    const prefix = `${name}=`;
    const line = envContents
        .split(/\r?\n/)
        .find((candidate) => candidate.trimStart().startsWith(prefix));

    if (!line) {
        return fallback;
    }

    let value = line.trimStart().slice(prefix.length).trim();

    if (
        value.length >= 2 &&
        ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'")))
    ) {
        value = value.slice(1, -1);
    }

    return value;
}

module.exports = {
    apps: [
        {
            name: 'laravel-queue',
            script: 'php',
            args: 'artisan queue:listen --tries=3 --timeout=90 --sleep=3',
            interpreter: 'none',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            env: {
                NODE_ENV: 'production',
            },
            error_file: './storage/logs/queue-error.log',
            out_file: './storage/logs/queue-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        },
        {
            name: 'soketi',
            script: fs.existsSync(localSoketiBin) ? localSoketiBin : 'soketi',
            args: 'start',
            interpreter: 'none',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            kill_timeout: 10000,
            env: {
                NODE_ENV: 'production',
                SOKETI_DEFAULT_APP_ID: envValue('PUSHER_APP_ID'),
                SOKETI_DEFAULT_APP_KEY: envValue('PUSHER_APP_KEY'),
                SOKETI_DEFAULT_APP_SECRET: envValue('PUSHER_APP_SECRET'),
                SOKETI_PORT: envValue('PUSHER_PORT', '6001'),
                SOKETI_DEBUG: '0',
            },
            error_file: './storage/logs/soketi-error.log',
            out_file: './storage/logs/soketi-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        },
    ],
};
