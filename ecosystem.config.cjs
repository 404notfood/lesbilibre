/* eslint-env node */
module.exports = {
    apps: [
        {
            name: 'laravel-queue',
            script: '/usr/bin/php',
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
            name: 'laravel-reverb',
            script: '/usr/bin/php',
            args: 'artisan reverb:start --host=127.0.0.1 --port=6001',
            interpreter: 'none',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '512M',
            kill_timeout: 10000,
            env: {
                NODE_ENV: 'production',
            },
            error_file: './storage/logs/reverb-error.log',
            out_file: './storage/logs/reverb-out.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        },
    ],
};
