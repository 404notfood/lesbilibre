<?php

namespace Tests\Unit;

use App\Services\GeocodingService;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GeocodingServiceTest extends TestCase
{
    protected GeocodingService $service;

    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
        $this->service = new GeocodingService;
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    protected function commune(string $nom, string $cp, float $lng, float $lat, int $population = 1000): array
    {
        return [
            'nom' => $nom,
            'code' => $cp,
            'codeDepartement' => substr($cp, 0, 2),
            'codesPostaux' => [$cp],
            'population' => $population,
            'centre' => ['type' => 'Point', 'coordinates' => [$lng, $lat]],
        ];
    }

    public function test_it_resolves_a_city_to_coordinates(): void
    {
        Http::fake([
            'geo.api.gouv.fr/*' => Http::response([
                $this->commune('Laval', '53000', -0.7692, 48.0578, 49492),
            ]),
        ]);

        $result = $this->service->resolveCity('Laval');

        $this->assertNotNull($result);
        $this->assertSame('Laval', $result['city']);
        $this->assertSame('53000', $result['postal_code']);
        $this->assertEqualsWithDelta(48.0578, $result['latitude'], 0.0001);
        $this->assertEqualsWithDelta(-0.7692, $result['longitude'], 0.0001);
        $this->assertSame('53', $result['department']);
    }

    public function test_it_prefers_an_exact_name_match_over_population(): void
    {
        Http::fake([
            'geo.api.gouv.fr/*' => Http::response([
                $this->commune('Laval-sur-Vologne', '88600', 6.6500, 48.1800, 900000),
                $this->commune('Laval', '53000', -0.7692, 48.0578, 49492),
            ]),
        ]);

        $result = $this->service->resolveCity('Laval');

        $this->assertNotNull($result);
        $this->assertSame('Laval', $result['city']);
    }

    public function test_it_matches_city_names_ignoring_case_and_accents(): void
    {
        Http::fake([
            'geo.api.gouv.fr/*' => Http::response([
                $this->commune('Nîmes', '30000', 4.3601, 43.8367, 150000),
                $this->commune('Nimes-Autre', '30001', 4.4000, 43.9000, 900000),
            ]),
        ]);

        $result = $this->service->resolveCity('NIMES');

        $this->assertNotNull($result);
        $this->assertSame('Nîmes', $result['city']);
    }

    public function test_it_returns_null_when_the_city_is_unknown(): void
    {
        Http::fake([
            'geo.api.gouv.fr/*' => Http::response([]),
        ]);

        $this->assertNull($this->service->resolveCity('Ville Qui Nexiste Pas'));
    }

    public function test_it_returns_null_when_the_api_fails(): void
    {
        Http::fake([
            'geo.api.gouv.fr/*' => Http::response([], 503),
        ]);

        $this->assertNull($this->service->resolveCity('Laval'));
    }

    public function test_it_resolves_a_postal_code_to_the_largest_commune(): void
    {
        Http::fake([
            'geo.api.gouv.fr/*' => Http::response([
                $this->commune('Petite Commune', '53940', -0.85, 48.09, 500),
                $this->commune('Saint-Berthevin', '53940', -0.8462, 48.0739, 7000),
            ]),
        ]);

        $result = $this->service->resolvePostalCode('53940');

        $this->assertNotNull($result);
        $this->assertSame('Saint-Berthevin', $result['city']);
    }

    public function test_it_rejects_a_malformed_postal_code(): void
    {
        $this->assertNull($this->service->resolvePostalCode('abc'));
        $this->assertNull($this->service->resolvePostalCode('123'));
    }

    public function test_it_ignores_communes_without_coordinates(): void
    {
        Http::fake([
            'geo.api.gouv.fr/*' => Http::response([
                ['nom' => 'Sans Centre', 'code' => '99999', 'codesPostaux' => ['99999']],
            ]),
        ]);

        $this->assertNull($this->service->resolveCity('Sans Centre'));
    }

    public function test_search_requires_at_least_two_characters(): void
    {
        $this->assertSame([], $this->service->search('L'));
    }
}
