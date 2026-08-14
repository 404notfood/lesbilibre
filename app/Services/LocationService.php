<?php

namespace App\Services;

class LocationService
{
    /**
     * Calculate distance between two points using Haversine formula.
     */
    public function calculateDistance(
        float $lat1,
        float $lon1,
        float $lat2,
        float $lon2
    ): float {
        $earthRadius = 6371; // Radius of the Earth in kilometers

        $latFrom = deg2rad($lat1);
        $lonFrom = deg2rad($lon1);
        $latTo = deg2rad($lat2);
        $lonTo = deg2rad($lon2);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) +
            cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));

        return round($angle * $earthRadius, 2);
    }

    /**
     * Get coordinates from city name (simplified for demo).
     * In production, use a geocoding API like Google Maps or Nominatim.
     */
    public function getCoordinatesFromCity(string $city): ?array
    {
        // Sample coordinates for French cities
        $cities = [
            'Paris' => ['lat' => 48.8566, 'lon' => 2.3522],
            'Lyon' => ['lat' => 45.7640, 'lon' => 4.8357],
            'Marseille' => ['lat' => 43.2965, 'lon' => 5.3698],
            'Toulouse' => ['lat' => 43.6047, 'lon' => 1.4442],
            'Nice' => ['lat' => 43.7102, 'lon' => 7.2620],
            'Nantes' => ['lat' => 47.2184, 'lon' => -1.5536],
            'Strasbourg' => ['lat' => 48.5734, 'lon' => 7.7521],
            'Montpellier' => ['lat' => 43.6108, 'lon' => 3.8767],
            'Bordeaux' => ['lat' => 44.8378, 'lon' => -0.5792],
            'Lille' => ['lat' => 50.6292, 'lon' => 3.0573],
            'Rennes' => ['lat' => 48.1173, 'lon' => -1.6778],
            'Reims' => ['lat' => 49.2583, 'lon' => 4.0317],
            'Le Havre' => ['lat' => 49.4944, 'lon' => 0.1079],
            'Saint-Étienne' => ['lat' => 45.4397, 'lon' => 4.3872],
            'Toulon' => ['lat' => 43.1242, 'lon' => 5.9280],
            'Grenoble' => ['lat' => 45.1885, 'lon' => 5.7245],
            'Dijon' => ['lat' => 47.3220, 'lon' => 5.0415],
            'Angers' => ['lat' => 47.4784, 'lon' => -0.5632],
            'Nîmes' => ['lat' => 43.8367, 'lon' => 4.3601],
            'Villeurbanne' => ['lat' => 45.7660, 'lon' => 4.8795],
        ];

        $normalizedCity = ucfirst(strtolower(trim($city)));

        return $cities[$normalizedCity] ?? null;
    }

    /**
     * Format distance for display.
     */
    public function formatDistance(float $distance): string
    {
        if ($distance < 1) {
            return 'À moins de 1 km';
        }

        if ($distance < 10) {
            return 'À '.round($distance, 1).' km';
        }

        return 'À '.round($distance).' km';
    }
}
