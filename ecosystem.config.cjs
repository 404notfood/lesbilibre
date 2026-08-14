/* eslint-env node */
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
  ],
};
