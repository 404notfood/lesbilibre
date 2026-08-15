<?php

namespace App\Services;

use App\Models\Profile;

class MatchScoreService
{
    public function __construct(
        protected LocationService $locationService
    ) {}

    /**
     * Calculate match score between two profiles.
     *
     * @return int Score between 0 and 100
     */
    public function calculateScore(Profile $profile1, Profile $profile2): int
    {
        $score = 0;

        // Interest compatibility (30 points)
        $score += $this->calculateInterestScore($profile1, $profile2);

        // Age preference compatibility (20 points)
        $score += $this->calculateAgeScore($profile1, $profile2);

        // Location proximity (15 points)
        $score += $this->calculateLocationScore($profile1, $profile2);

        // Lifestyle compatibility (15 points)
        $score += $this->calculateLifestyleScore($profile1, $profile2);

        // Sexual orientation compatibility (10 points)
        $score += $this->calculateOrientationScore($profile1, $profile2);

        // Relationship goals compatibility (10 points)
        $score += $this->calculateRelationshipScore($profile1, $profile2);

        // Ensure score is between 70-100 for better UX
        return max(70, min(100, $score));
    }

    protected function calculateInterestScore(Profile $profile1, Profile $profile2): int
    {
        $interests1 = $profile1->interests ?? [];
        $interests2 = $profile2->interests ?? [];

        if (empty($interests1) || empty($interests2)) {
            return 15; // Base score
        }

        $common = count(array_intersect($interests1, $interests2));
        $total = count(array_unique(array_merge($interests1, $interests2)));

        $percentage = $total > 0 ? ($common / $total) : 0;

        return (int) round($percentage * 30);
    }

    protected function calculateAgeScore(Profile $profile1, Profile $profile2): int
    {
        $age1 = $profile1->age;
        $age2 = $profile2->age;

        if ($age1 === null || $age2 === null) {
            return 10;
        }

        // Check if ages match preferences
        $match1 = $age2 >= ($profile1->min_age_preference ?? 18)
            && $age2 <= ($profile1->max_age_preference ?? 99);
        $match2 = $age1 >= ($profile2->min_age_preference ?? 18)
            && $age1 <= ($profile2->max_age_preference ?? 99);

        if ($match1 && $match2) {
            return 20;
        }

        if ($match1 || $match2) {
            return 10;
        }

        return 5;
    }

    protected function calculateLocationScore(Profile $profile1, Profile $profile2): int
    {
        if (! $profile1->latitude || ! $profile1->longitude ||
            ! $profile2->latitude || ! $profile2->longitude) {
            return 8; // Base score if no location data
        }

        $distance = $this->locationService->calculateDistance(
            $profile1->latitude,
            $profile1->longitude,
            $profile2->latitude,
            $profile2->longitude
        );

        // Closer is better
        if ($distance < 10) {
            return 15;
        }

        if ($distance < 50) {
            return 12;
        }

        if ($distance < 100) {
            return 8;
        }

        return 5;
    }

    protected function calculateLifestyleScore(Profile $profile1, Profile $profile2): int
    {
        $score = 0;

        // Smoking preference
        if ($profile1->smokes === $profile2->smokes) {
            $score += 5;
        }

        // Drinking preference
        if ($profile1->drinks === $profile2->drinks) {
            $score += 5;
        }

        // Children preference
        if ($profile1->has_children === $profile2->has_children) {
            $score += 3;
        }

        if ($profile1->wants_children === $profile2->wants_children) {
            $score += 2;
        }

        return $score;
    }

    protected function calculateOrientationScore(Profile $profile1, Profile $profile2): int
    {
        // Both should be interested in the same orientation
        if ($profile1->sexual_orientation === $profile2->sexual_orientation) {
            return 10;
        }

        // Compatible orientations (bi, pan, queer)
        $flexible = ['bi', 'bisexuelle', 'pan', 'pansexuelle', 'queer'];

        if (in_array(strtolower($profile1->sexual_orientation ?? ''), $flexible) ||
            in_array(strtolower($profile2->sexual_orientation ?? ''), $flexible)) {
            return 8;
        }

        return 5;
    }

    protected function calculateRelationshipScore(Profile $profile1, Profile $profile2): int
    {
        if ($profile1->looking_for === $profile2->looking_for) {
            return 10;
        }

        // Compatible if both are open or casual
        $casual = ['casual', 'amitié', 'friendship'];

        if (in_array(strtolower($profile1->looking_for ?? ''), $casual) &&
            in_array(strtolower($profile2->looking_for ?? ''), $casual)) {
            return 7;
        }

        return 4;
    }
}
