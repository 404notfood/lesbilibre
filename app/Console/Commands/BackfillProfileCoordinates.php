<?php

namespace App\Console\Commands;

use App\Models\Profile;
use App\Services\GeocodingService;
use Illuminate\Console\Command;

class BackfillProfileCoordinates extends Command
{
    /**
     * Bornes de la France métropolitaine. Les DOM-TOM sortent volontairement
     * de cette zone : ils sont validés par l'écart au centroïde de la ville
     * plutôt que par ces bornes.
     */
    protected const FRANCE_BOUNDS = [
        'lat_min' => 41.3,
        'lat_max' => 51.1,
        'lng_min' => -5.2,
        'lng_max' => 9.6,
    ];

    /**
     * Écart maximal toléré (km) entre la position enregistrée et le centroïde
     * de la ville déclarée. Au-delà, les coordonnées sont jugées incohérentes.
     */
    protected const MAX_DRIFT_KM = 15;

    protected $signature = 'profiles:backfill-coordinates
                            {--dry-run : Affiche les changements sans les enregistrer}
                            {--all : Re-géocode tous les profils, même ceux jugés valides}';

    protected $description = 'Renseigne et corrige les coordonnées GPS des profils depuis leur ville';

    public function handle(GeocodingService $geocoding): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $all = (bool) $this->option('all');

        $profiles = Profile::query()
            ->whereNotNull('city')
            ->where('city', '!=', '')
            ->get();

        if ($profiles->isEmpty()) {
            $this->info('Aucun profil avec une ville renseignée.');

            return self::SUCCESS;
        }

        $this->info(($dryRun ? '[DRY-RUN] ' : '').'Traitement de '.$profiles->count().' profils...');
        $this->newLine();

        $updated = 0;
        $skipped = 0;
        $failed = [];
        $bar = $this->output->createProgressBar($profiles->count());
        $bar->start();

        foreach ($profiles as $profile) {
            // On résout toujours la ville : c'est le seul moyen de détecter des
            // coordonnées incohérentes qui tombent malgré tout en France.
            $resolved = $geocoding->resolveCity($profile->city);

            if ($resolved === null) {
                $failed[] = $profile->user_id.' — '.$profile->city;
                $bar->advance();

                continue;
            }

            if (! $all && ! $this->needsFixing($profile, $resolved)) {
                $skipped++;
                $bar->advance();

                continue;
            }

            if (! $dryRun) {
                $profile->forceFill([
                    'city' => $resolved['city'],
                    'postal_code' => $resolved['postal_code'],
                    'latitude' => $resolved['latitude'],
                    'longitude' => $resolved['longitude'],
                ])->save();
            }

            $updated++;
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        $this->table(
            ['Résultat', 'Nombre'],
            [
                [$dryRun ? 'À corriger' : 'Corrigés', $updated],
                ['Déjà valides (ignorés)', $skipped],
                ['Villes non résolues', count($failed)],
            ]
        );

        if ($failed !== []) {
            $this->warn('Villes non résolues :');
            foreach ($failed as $line) {
                $this->line('  - '.$line);
            }
        }

        if ($dryRun) {
            $this->newLine();
            $this->comment('Aucune modification enregistrée (--dry-run).');
        }

        return self::SUCCESS;
    }

    /**
     * Un profil doit être corrigé s'il n'a pas de coordonnées, si celles-ci
     * sortent de France, ou si elles s'écartent trop du centroïde de la ville
     * déclarée (cas des données générées aléatoirement par les seeders).
     *
     * @param  array{latitude: float, longitude: float, postal_code: string|null}  $resolved
     */
    protected function needsFixing(Profile $profile, array $resolved): bool
    {
        if ($profile->latitude === null || $profile->longitude === null) {
            return true;
        }

        $lat = (float) $profile->latitude;
        $lng = (float) $profile->longitude;

        $drift = $this->distanceKm($lat, $lng, $resolved['latitude'], $resolved['longitude']);

        // Hors métropole, seule la cohérence avec la ville déclarée fait foi
        // (un profil réunionnais est légitimement à 9 000 km de la métropole).
        $outOfMetropolitanFrance = $lat < self::FRANCE_BOUNDS['lat_min']
            || $lat > self::FRANCE_BOUNDS['lat_max']
            || $lng < self::FRANCE_BOUNDS['lng_min']
            || $lng > self::FRANCE_BOUNDS['lng_max'];

        if ($outOfMetropolitanFrance && $drift > self::MAX_DRIFT_KM) {
            return true;
        }

        if (blank($profile->postal_code) || $profile->postal_code !== $resolved['postal_code']) {
            return true;
        }

        return $drift > self::MAX_DRIFT_KM;
    }

    /**
     * Distance orthodromique en kilomètres (formule de Haversine).
     */
    protected function distanceKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $latDelta = deg2rad($lat2 - $lat1);
        $lngDelta = deg2rad($lng2 - $lng1);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($lngDelta / 2) ** 2;

        return 6371 * 2 * asin(min(1.0, sqrt($a)));
    }
}
