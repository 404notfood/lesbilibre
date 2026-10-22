<?php

// Use the local connection settings in memory; never copy credentials to a file
// or run RefreshDatabase against the application's database.
require __DIR__.'/../vendor/autoload.php';
$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

if ($app->configurationIsCached()) {
    fwrite(STDERR, "Configuration en cache : utiliser une copie de développement sans cache pour cet essai.\n");
    exit(1);
}
$connection = Illuminate\Support\Facades\DB::connection();
$config = $connection->getConfig();
if ($config['driver'] !== 'mysql' || ! in_array($config['host'], ['localhost', '127.0.0.1', '::1'], true)) {
    fwrite(STDERR, "Essai limité à une connexion MySQL locale. Utiliser le service MySQL isolé de la CI pour les autres environnements.\n");
    exit(1);
}
$database = 'lesbilibre_testing_20261021_'.bin2hex(random_bytes(4));
$created = false;
$result = 1;
try {
    $connection->statement('CREATE DATABASE `'.$database.'` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $created = true;
    $environment = array_merge(getenv(), [
        'APP_ENV' => 'testing', 'DB_URL' => '', 'DB_CONNECTION' => 'mysql',
        'DB_HOST' => $config['host'], 'DB_PORT' => (string) $config['port'],
        'DB_DATABASE' => $database, 'DB_USERNAME' => $config['username'],
        'DB_PASSWORD' => $config['password'] ?? '', 'DB_SOCKET' => '',
    ]);
    $process = proc_open([
        PHP_BINARY, 'vendor/phpunit/phpunit/phpunit', '--filter=SearchDistanceTest', '--colors=never',
    ], [STDIN, STDOUT, STDERR], $pipes, dirname(__DIR__), $environment, ['bypass_shell' => true]);
    $result = is_resource($process) ? proc_close($process) : 1;
} catch (Throwable $exception) {
    fwrite(STDERR, "Impossible d’exécuter l’essai MySQL isolé. Vérifier les droits locaux de création d’une base temporaire. Aucune valeur de connexion n’est affichée.\n");
} finally {
    if ($created && preg_match('/^lesbilibre_testing_20261021_[a-f0-9]{8}$/D', $database)) {
        $connection->statement('DROP DATABASE `'.$database.'`');
        fwrite(STDOUT, "Base temporaire de cet essai supprimée.\n");
    }
}
exit($result);
