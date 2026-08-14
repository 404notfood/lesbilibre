<?php

namespace App\Services;

use App\Models\BlockedUser;
use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class MatchingService
{
    /**
     * Get all matches for a user.
     */
    public function getUserMatches(User $user): Collection
    {
        $matches = UserMatch::where(function ($q) use ($user) {
            $q->where('user1_id', $user->id)
                ->orWhere('user2_id', $user->id);
        })
            ->with(['user1.profile', 'user1.photos' => function ($query) {
                $query->where('is_approved', true)->where('is_primary', true);
            }, 'user2.profile', 'user2.photos' => function ($query) {
                $query->where('is_approved', true)->where('is_primary', true);
            }])
            ->latest('matched_at')
            ->get()
            ->map(function ($match) use ($user) {
                // Return the other user
                return $match->user1_id === $user->id ? $match->user2 : $match->user1;
            });

        return $matches;
    }

    /**
     * Get recommended profiles based on preferences and compatibility.
     */
    public function getRecommendations(User $user, int $limit = 20): Collection
    {
        $profile = $user->profile;

        if (! $profile) {
            return collect([]);
        }

        // Get IDs to exclude (already liked, already matched, banned users)
        $excludeIds = $this->getExcludedUserIds($user);

        $query = User::with(['profile', 'photos' => function ($query) {
            $query->where('is_approved', true)->where('is_primary', true);
        }])
            ->whereNotIn('id', $excludeIds)
            ->where('is_verified', true)
            ->where('is_banned', false)
            ->whereHas('profile', function ($query) use ($profile) {
                $query->whereNotNull('bio')->whereNotNull('looking_for')->where('is_discoverable', true);
                // Age preferences
                $birthYear = now()->year - $profile->date_of_birth->age;
                $minBirthYear = now()->year - $profile->max_age_preference;
                $maxBirthYear = now()->year - $profile->min_age_preference;

                $query->whereBetween(DB::raw('YEAR(date_of_birth)'), [$minBirthYear, $maxBirthYear]);

                // Location radius if coordinates available
                if ($profile->latitude && $profile->longitude) {
                    $this->addDistanceFilter($query, $profile->latitude, $profile->longitude, $profile->search_radius);
                }
            })
            ->whereHas('photos', fn ($query) => $query->where('is_approved', true));

        // Get users and calculate compatibility score
        $users = $query->get();

        // Calculate compatibility score for each user
        $scoredUsers = $users->map(function ($candidateUser) use ($profile) {
            $score = $this->calculateCompatibilityScore($profile, $candidateUser->profile);
            $candidateUser->compatibility_score = $score;

            return $candidateUser;
        });

        // Sort by compatibility score and return top matches
        return $scoredUsers->sortByDesc('compatibility_score')->take($limit)->values();
    }

    /**
     * Calculate compatibility score between two profiles.
     */
    protected function calculateCompatibilityScore($userProfile, $candidateProfile): int
    {
        $score = 0;

        // Distance score (closer is better)
        if ($userProfile->latitude && $userProfile->longitude &&
            $candidateProfile->latitude && $candidateProfile->longitude) {
            $distance = $this->calculateDistance(
                $userProfile->latitude,
                $userProfile->longitude,
                $candidateProfile->latitude,
                $candidateProfile->longitude
            );

            if ($distance <= 10) {
                $score += 50;
            } elseif ($distance <= 25) {
                $score += 30;
            } elseif ($distance <= 50) {
                $score += 15;
            }
        }

        // Common interests
        if ($userProfile->interests && $candidateProfile->interests) {
            $commonInterests = array_intersect($userProfile->interests, $candidateProfile->interests);
            $score += count($commonInterests) * 10;
        }

        // Common languages
        if ($userProfile->languages && $candidateProfile->languages) {
            $commonLanguages = array_intersect($userProfile->languages, $candidateProfile->languages);
            $score += count($commonLanguages) * 5;
        }

        // Similar lifestyle choices
        if ($userProfile->has_children === $candidateProfile->has_children) {
            $score += 10;
        }

        if ($userProfile->wants_children === $candidateProfile->wants_children) {
            $score += 10;
        }

        if ($userProfile->smokes === $candidateProfile->smokes) {
            $score += 5;
        }

        // Education level
        if ($userProfile->education && $candidateProfile->education &&
            $userProfile->education === $candidateProfile->education) {
            $score += 10;
        }

        return $score;
    }

    /**
     * Add distance filter to query using Haversine formula.
     */
    protected function addDistanceFilter($query, float $lat, float $lon, int $radiusKm): void
    {
        $query->whereRaw(
            '(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) <= ?',
            [$lat, $lon, $lat, $radiusKm]
        );
    }

    /**
     * Calculate distance between two coordinates in kilometers.
     */
    protected function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371; // Earth radius in kilometers

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }

    /**
     * Get user IDs to exclude from recommendations.
     */
    protected function getExcludedUserIds(User $user): array
    {
        $excludeIds = [$user->id];

        // Already liked users
        $likedIds = $user->likesGiven()->pluck('liked_user_id')->toArray();
        $excludeIds = array_merge($excludeIds, $likedIds);

        // Already matched users
        $matchedIds = UserMatch::where(function ($q) use ($user) {
            $q->where('user1_id', $user->id)
                ->orWhere('user2_id', $user->id);
        })
            ->get()
            ->map(function ($match) use ($user) {
                return $match->user1_id === $user->id ? $match->user2_id : $match->user1_id;
            })
            ->toArray();

        $excludeIds = array_merge($excludeIds, $matchedIds);

        // Blocked users (both directions)
        $blockedIds = BlockedUser::where('blocker_id', $user->id)
            ->pluck('blocked_id')
            ->toArray();
        $blockedByIds = BlockedUser::where('blocked_id', $user->id)
            ->pluck('blocker_id')
            ->toArray();
        $excludeIds = array_merge($excludeIds, $blockedIds, $blockedByIds);

        return array_unique($excludeIds);
    }
}
