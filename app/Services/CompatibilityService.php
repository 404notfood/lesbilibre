<?php

namespace App\Services;

use App\Models\User;

class CompatibilityService
{
    /**
     * Calculate compatibility score between two users (0-100).
     */
    public function calculateScore(User $user1, User $user2): float
    {
        $score = 0;
        $maxScore = 0;

        $profile1 = $user1->profile;
        $profile2 = $user2->profile;

        if (! $profile1 || ! $profile2) {
            return 0;
        }

        // 1. Sexual orientation compatibility (20 points)
        $maxScore += 20;
        if ($this->isOrientationCompatible($profile1, $profile2)) {
            $score += 20;
        }

        // 2. Age preference compatibility (15 points)
        $maxScore += 15;
        $ageScore = $this->calculateAgeCompatibility($profile1, $profile2);
        $score += $ageScore * 15;

        // 3. Distance compatibility (10 points)
        $maxScore += 10;
        $distanceScore = $this->calculateDistanceCompatibility($profile1, $profile2);
        $score += $distanceScore * 10;

        // 4. Interests overlap (20 points)
        $maxScore += 20;
        $interestsScore = $this->calculateInterestsCompatibility($profile1, $profile2);
        $score += $interestsScore * 20;

        // 5. Lifestyle compatibility (15 points)
        $maxScore += 15;
        $lifestyleScore = $this->calculateLifestyleCompatibility($profile1, $profile2);
        $score += $lifestyleScore * 15;

        // 6. Naughty interests compatibility (20 points) - only if both have naughty mode
        if ($profile1->is_naughty_mode && $profile2->is_naughty_mode) {
            $maxScore += 20;
            $naughtyScore = $this->calculateNaughtyCompatibility($profile1, $profile2);
            $score += $naughtyScore * 20;
        }

        return $maxScore > 0 ? round(($score / $maxScore) * 100, 2) : 0;
    }

    protected function isOrientationCompatible($profile1, $profile2): bool
    {
        $compatibleOrientations = [
            'lesbian' => ['lesbian', 'bisexual', 'queer'],
            'bisexual' => ['lesbian', 'bisexual', 'queer'],
            'queer' => ['lesbian', 'bisexual', 'queer'],
            'questioning' => ['lesbian', 'bisexual', 'queer', 'questioning'],
        ];

        $orientation1 = $profile1->sexual_orientation ?? 'other';
        $orientation2 = $profile2->sexual_orientation ?? 'other';

        if (! isset($compatibleOrientations[$orientation1])) {
            return true; // Default to compatible if orientation not recognized
        }

        return in_array($orientation2, $compatibleOrientations[$orientation1]);
    }

    protected function calculateAgeCompatibility($profile1, $profile2): float
    {
        $age1 = $profile1->age ?? 0;
        $age2 = $profile2->age ?? 0;

        if ($age1 === 0 || $age2 === 0) {
            return 0;
        }

        // Check if each user is within the other's age preference
        $minAge1 = $profile1->min_age_preference ?? 18;
        $maxAge1 = $profile1->max_age_preference ?? 99;
        $minAge2 = $profile2->min_age_preference ?? 18;
        $maxAge2 = $profile2->max_age_preference ?? 99;

        $user1InRange = $age2 >= $minAge1 && $age2 <= $maxAge1;
        $user2InRange = $age1 >= $minAge2 && $age1 <= $maxAge2;

        if ($user1InRange && $user2InRange) {
            return 1.0;
        }

        if ($user1InRange || $user2InRange) {
            return 0.5;
        }

        return 0;
    }

    protected function calculateDistanceCompatibility($profile1, $profile2): float
    {
        if (! $profile1->latitude || ! $profile1->longitude || ! $profile2->latitude || ! $profile2->longitude) {
            return 0.5; // Neutral score if location not available
        }

        $distance = $this->calculateDistance(
            $profile1->latitude,
            $profile1->longitude,
            $profile2->latitude,
            $profile2->longitude
        );

        $radius1 = $profile1->search_radius ?? 50;
        $radius2 = $profile2->search_radius ?? 50;
        $maxRadius = max($radius1, $radius2);

        if ($distance <= $maxRadius * 0.25) {
            return 1.0; // Very close
        }

        if ($distance <= $maxRadius * 0.5) {
            return 0.75; // Close
        }

        if ($distance <= $maxRadius) {
            return 0.5; // Within range
        }

        return 0.25; // Far but might still be interesting
    }

    protected function calculateInterestsCompatibility($profile1, $profile2): float
    {
        $interests1 = $profile1->interests ?? [];
        $interests2 = $profile2->interests ?? [];

        if (empty($interests1) || empty($interests2)) {
            return 0.5; // Neutral if no interests
        }

        $commonInterests = array_intersect($interests1, $interests2);
        $totalInterests = array_unique(array_merge($interests1, $interests2));

        return count($totalInterests) > 0 ? count($commonInterests) / count($totalInterests) : 0;
    }

    protected function calculateLifestyleCompatibility($profile1, $profile2): float
    {
        $score = 0;
        $factors = 0;

        // Children compatibility
        if ($profile1->has_children !== null && $profile2->has_children !== null) {
            $factors++;
            if ($profile1->has_children === $profile2->has_children) {
                $score += 0.5;
            }
        }

        if ($profile1->wants_children !== null && $profile2->wants_children !== null) {
            $factors++;
            if ($profile1->wants_children === $profile2->wants_children) {
                $score += 0.5;
            }
        }

        // Smoking compatibility
        if ($profile1->smokes !== null && $profile2->smokes !== null) {
            $factors++;
            if ($profile1->smokes === $profile2->smokes) {
                $score += 0.5;
            }
        }

        // Drinking compatibility
        if ($profile1->drinks !== null && $profile2->drinks !== null) {
            $factors++;
            if ($profile1->drinks === $profile2->drinks) {
                $score += 0.5;
            }
        }

        return $factors > 0 ? $score / $factors : 0.5;
    }

    protected function calculateNaughtyCompatibility($profile1, $profile2): float
    {
        $interests1 = $profile1->naughtyInterests->pluck('id')->toArray();
        $interests2 = $profile2->naughtyInterests->pluck('id')->toArray();

        if (empty($interests1) || empty($interests2)) {
            return 0.5; // Neutral if no naughty interests
        }

        $commonInterests = array_intersect($interests1, $interests2);
        $totalInterests = array_unique(array_merge($interests1, $interests2));

        return count($totalInterests) > 0 ? count($commonInterests) / count($totalInterests) : 0;
    }

    protected function calculateDistance(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $earthRadius = 6371; // km

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Get compatibility category based on score.
     */
    public function getCompatibilityCategory(float $score): array
    {
        if ($score >= 80) {
            return [
                'level' => 'excellent',
                'label' => 'Match Parfait',
                'emoji' => '💖',
                'color' => 'green',
            ];
        }

        if ($score >= 60) {
            return [
                'level' => 'good',
                'label' => 'Très Compatible',
                'emoji' => '💕',
                'color' => 'blue',
            ];
        }

        if ($score >= 40) {
            return [
                'level' => 'medium',
                'label' => 'Compatible',
                'emoji' => '💜',
                'color' => 'purple',
            ];
        }

        if ($score >= 20) {
            return [
                'level' => 'low',
                'label' => 'Peu Compatible',
                'emoji' => '💙',
                'color' => 'gray',
            ];
        }

        return [
            'level' => 'minimal',
            'label' => 'À Découvrir',
            'emoji' => '💛',
            'color' => 'yellow',
        ];
    }
}
