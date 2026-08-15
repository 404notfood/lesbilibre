<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Résout une commune française en coordonnées GPS via l'API officielle
 * geo.api.gouv.fr (même source que l'autocomplétion côté front).
 */
class GeocodingService
{
    protected const BASE_URL = 'https://geo.api.gouv.fr/communes';

    protected const CACHE_TTL = 60 * 60 * 24 * 30;

    protected const FIELDS = 'nom,code,codeDepartement,codesPostaux,centre,population';

    /**
     * Résout une ville (et éventuellement son code postal) en données géographiques.
     *
     * @return array{city: string, postal_code: string|null, latitude: float, longitude: float, insee_code: string, department: string}|null
     */
    public function resolveCity(string $city, ?string $postalCode = null): ?array
    {
        $city = trim($city);

        if ($city === '') {
            return null;
        }

        $cacheKey = 'geocode:city:'.md5(mb_strtolower($city).'|'.($postalCode ?? ''));

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($city, $postalCode) {
            $communes = $this->fetchCommunes($city, $postalCode);

            if ($communes === []) {
                return null;
            }

            return $this->toResult($this->pickBestMatch($communes, $city));
        });
    }

    /**
     * Résout un code postal en commune principale (la plus peuplée).
     *
     * @return array{city: string, postal_code: string|null, latitude: float, longitude: float, insee_code: string, department: string}|null
     */
    public function resolvePostalCode(string $postalCode): ?array
    {
        $postalCode = trim($postalCode);

        if (! preg_match('/^\d{5}$/', $postalCode)) {
            return null;
        }

        $cacheKey = 'geocode:postal:'.$postalCode;

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($postalCode) {
            $communes = $this->request(['codePostal' => $postalCode]);

            if ($communes === []) {
                return null;
            }

            usort($communes, fn ($a, $b) => ($b['population'] ?? 0) <=> ($a['population'] ?? 0));

            return $this->toResult($communes[0]);
        });
    }

    /**
     * Recherche des communes pour de l'autocomplétion.
     *
     * @return list<array{city: string, postal_code: string|null, latitude: float, longitude: float, insee_code: string, department: string}>
     */
    public function search(string $term, int $limit = 10): array
    {
        $term = trim($term);

        if (mb_strlen($term) < 2) {
            return [];
        }

        $params = preg_match('/^\d{2,5}$/', $term)
            ? ['codePostal' => $term]
            : ['nom' => $term, 'boost' => 'population'];

        $communes = $this->request($params + ['limit' => $limit]);

        return array_values(array_filter(array_map(
            fn (array $commune) => $this->toResult($commune),
            $communes
        )));
    }

    /**
     * @return list<array<string, mixed>>
     */
    protected function fetchCommunes(string $city, ?string $postalCode): array
    {
        if ($postalCode !== null && preg_match('/^\d{5}$/', trim($postalCode))) {
            $communes = $this->request(['codePostal' => trim($postalCode)]);

            if ($communes !== []) {
                return $communes;
            }
        }

        return $this->request(['nom' => $city, 'boost' => 'population', 'limit' => 20]);
    }

    /**
     * Choisit la commune la plus pertinente : correspondance exacte du nom
     * en priorité, sinon la plus peuplée.
     *
     * @param  list<array<string, mixed>>  $communes
     * @return array<string, mixed>
     */
    protected function pickBestMatch(array $communes, string $city): array
    {
        $normalized = $this->normalize($city);

        foreach ($communes as $commune) {
            if ($this->normalize($commune['nom'] ?? '') === $normalized) {
                return $commune;
            }
        }

        usort($communes, fn ($a, $b) => ($b['population'] ?? 0) <=> ($a['population'] ?? 0));

        return $communes[0];
    }

    /**
     * @param  array<string, mixed>  $commune
     * @return array{city: string, postal_code: string|null, latitude: float, longitude: float, insee_code: string, department: string}|null
     */
    protected function toResult(array $commune): ?array
    {
        $coordinates = $commune['centre']['coordinates'] ?? null;

        if (! is_array($coordinates) || count($coordinates) < 2) {
            return null;
        }

        return [
            'city' => $commune['nom'],
            'postal_code' => $commune['codesPostaux'][0] ?? null,
            'longitude' => (float) $coordinates[0],
            'latitude' => (float) $coordinates[1],
            'insee_code' => $commune['code'] ?? '',
            'department' => $commune['codeDepartement'] ?? '',
        ];
    }

    /**
     * @param  array<string, mixed>  $params
     * @return list<array<string, mixed>>
     */
    protected function request(array $params): array
    {
        try {
            $response = Http::timeout(5)
                ->retry(2, 200)
                ->get(self::BASE_URL, $params + ['fields' => self::FIELDS]);

            if (! $response->successful()) {
                return [];
            }

            $data = $response->json();

            return is_array($data) ? $data : [];
        } catch (\Throwable $e) {
            Log::warning('Geocoding request failed', [
                'params' => $params,
                'message' => $e->getMessage(),
            ]);

            return [];
        }
    }

    protected function normalize(string $value): string
    {
        $value = mb_strtolower(trim($value));
        $value = strtr($value, [
            'à' => 'a', 'â' => 'a', 'ä' => 'a', 'ç' => 'c', 'é' => 'e', 'è' => 'e',
            'ê' => 'e', 'ë' => 'e', 'î' => 'i', 'ï' => 'i', 'ô' => 'o', 'ö' => 'o',
            'ù' => 'u', 'û' => 'u', 'ü' => 'u', 'ÿ' => 'y', 'œ' => 'oe', 'æ' => 'ae',
        ]);

        return preg_replace('/[^a-z0-9]+/', '', $value) ?? $value;
    }
}
