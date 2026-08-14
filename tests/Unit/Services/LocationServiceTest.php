<?php

namespace Tests\Unit\Services;

use App\Services\LocationService;
use PHPUnit\Framework\TestCase;

class LocationServiceTest extends TestCase
{
    protected LocationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new LocationService;
    }

    // --- calculateDistance ---

    public function test_calculate_distance_paris_to_lyon(): void
    {
        $distance = $this->service->calculateDistance(48.8566, 2.3522, 45.7640, 4.8357);

        // Paris to Lyon is approximately 392 km
        $this->assertGreaterThan(380, $distance);
        $this->assertLessThan(400, $distance);
    }

    public function test_calculate_distance_paris_to_marseille(): void
    {
        $distance = $this->service->calculateDistance(48.8566, 2.3522, 43.2965, 5.3698);

        // Paris to Marseille is approximately 660 km
        $this->assertGreaterThan(650, $distance);
        $this->assertLessThan(670, $distance);
    }

    public function test_calculate_distance_same_coordinates(): void
    {
        $distance = $this->service->calculateDistance(48.8566, 2.3522, 48.8566, 2.3522);

        $this->assertEquals(0.0, $distance);
    }

    public function test_calculate_distance_very_close_points(): void
    {
        // Two points in central Paris, about 1km apart
        $distance = $this->service->calculateDistance(48.8566, 2.3522, 48.8600, 2.3600);

        $this->assertLessThan(2, $distance);
        $this->assertGreaterThan(0, $distance);
    }

    // --- getCoordinatesFromCity ---

    public function test_get_coordinates_paris(): void
    {
        $coords = $this->service->getCoordinatesFromCity('Paris');

        $this->assertNotNull($coords);
        $this->assertArrayHasKey('lat', $coords);
        $this->assertArrayHasKey('lon', $coords);
        $this->assertEqualsWithDelta(48.8566, $coords['lat'], 0.01);
    }

    public function test_get_coordinates_lyon(): void
    {
        $coords = $this->service->getCoordinatesFromCity('Lyon');

        $this->assertNotNull($coords);
        $this->assertEqualsWithDelta(45.764, $coords['lat'], 0.01);
    }

    public function test_get_coordinates_case_insensitive(): void
    {
        $coords1 = $this->service->getCoordinatesFromCity('paris');
        $coords2 = $this->service->getCoordinatesFromCity('PARIS');

        $this->assertNotNull($coords1);
        $this->assertNotNull($coords2);
        $this->assertEquals($coords1, $coords2);
    }

    public function test_get_coordinates_with_spaces(): void
    {
        $coords = $this->service->getCoordinatesFromCity('  paris  ');

        $this->assertNotNull($coords);
    }

    public function test_get_coordinates_unknown_city_returns_null(): void
    {
        $coords = $this->service->getCoordinatesFromCity('InventedCity');

        $this->assertNull($coords);
    }

    // --- formatDistance ---

    public function test_format_distance_under_1km(): void
    {
        $result = $this->service->formatDistance(0.5);

        $this->assertEquals('À moins de 1 km', $result);
    }

    public function test_format_distance_1_to_10km(): void
    {
        $result = $this->service->formatDistance(5.7);

        $this->assertEquals('À 5.7 km', $result);
    }

    public function test_format_distance_over_10km(): void
    {
        $result = $this->service->formatDistance(42.6);

        $this->assertEquals('À 43 km', $result);
    }

    public function test_format_distance_exactly_1km(): void
    {
        $result = $this->service->formatDistance(1.0);

        $this->assertEquals('À 1 km', $result);
    }
}
