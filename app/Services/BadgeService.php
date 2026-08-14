<?php

namespace App\Services;

use App\Models\Badge;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class BadgeService
{
    /**
     * Check and award all eligible badges for a user.
     */
    public function checkAndAwardBadges(User $user): array
    {
        $awarded = [];
        $badges = Badge::where('is_active', true)->get();

        foreach ($badges as $badge) {
            if ($this->shouldAwardBadge($user, $badge)) {
                $this->awardBadge($user, $badge);
                $awarded[] = $badge;
            } else {
                $this->updateProgress($user, $badge);
            }
        }

        return $awarded;
    }

    /**
     * Check if user should be awarded a badge.
     */
    public function shouldAwardBadge(User $user, Badge $badge): bool
    {
        // Check if already awarded
        $userBadge = $user->badges()->where('badge_id', $badge->id)->first();
        if ($userBadge && $userBadge->pivot->awarded_at) {
            return false;
        }

        // Check criteria
        if (! $badge->criteria) {
            return false;
        }

        return $this->checkCriteria($user, $badge->criteria);
    }

    /**
     * Award a badge to a user.
     */
    public function awardBadge(User $user, Badge $badge): void
    {
        $user->badges()->syncWithoutDetaching([
            $badge->id => [
                'progress' => 100,
                'awarded_at' => now(),
            ],
        ]);

        // Award gems as bonus
        if ($badge->points > 0) {
            app(GemService::class)->addGems(
                $user,
                $badge->points,
                'earn',
                'badge_earned',
                "Badge obtenu : {$badge->name}",
                ['badge_id' => $badge->id]
            );
        }
    }

    /**
     * Update progress towards a badge.
     */
    public function updateProgress(User $user, Badge $badge): void
    {
        if (! $badge->criteria) {
            return;
        }

        $progress = $this->calculateProgress($user, $badge->criteria);

        $user->badges()->syncWithoutDetaching([
            $badge->id => [
                'progress' => min($progress, 100),
                'awarded_at' => null,
            ],
        ]);
    }

    /**
     * Check if user meets badge criteria.
     */
    protected function checkCriteria(User $user, array $criteria): bool
    {
        $type = $criteria['type'] ?? null;
        $target = $criteria['target'] ?? 0;

        return match ($type) {
            'profile_complete' => $this->checkProfileComplete($user),
            'photos_count' => $user->photos()->where('is_approved', true)->count() >= $target,
            'likes_given' => $user->likesGiven()->count() >= $target,
            'likes_received' => $user->likesReceived()->count() >= $target,
            'matches_count' => $this->getMatchesCount($user) >= $target,
            'messages_sent' => $user->messagesSent()->count() >= $target,
            'days_active' => $user->created_at->diffInDays(now()) >= $target,
            'verified_profile' => $user->is_verified,
            'premium_user' => $user->is_premium,
            default => false,
        };
    }

    /**
     * Calculate progress percentage towards a badge.
     */
    protected function calculateProgress(User $user, array $criteria): int
    {
        $type = $criteria['type'] ?? null;
        $target = $criteria['target'] ?? 1;

        if ($target === 0) {
            return 0;
        }

        $current = match ($type) {
            'photos_count' => $user->photos()->where('is_approved', true)->count(),
            'likes_given' => $user->likesGiven()->count(),
            'likes_received' => $user->likesReceived()->count(),
            'matches_count' => $this->getMatchesCount($user),
            'messages_sent' => $user->messagesSent()->count(),
            'days_active' => $user->created_at->diffInDays(now()),
            default => 0,
        };

        return (int) min(($current / $target) * 100, 100);
    }

    /**
     * Check if user profile is complete.
     */
    protected function checkProfileComplete(User $user): bool
    {
        if (! $user->profile) {
            return false;
        }

        $profile = $user->profile;
        $requiredFields = [
            'date_of_birth',
            'city',
            'bio',
            'sexual_orientation',
            'looking_for',
        ];

        foreach ($requiredFields as $field) {
            if (empty($profile->$field)) {
                return false;
            }
        }

        // At least one photo
        return $user->photos()->where('is_approved', true)->exists();
    }

    /**
     * Get total matches count for a user.
     */
    protected function getMatchesCount(User $user): int
    {
        return DB::table('user_matches')
            ->where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)
                    ->orWhere('user2_id', $user->id);
            })
            ->count();
    }

    /**
     * Get user's badges with progress.
     */
    public function getUserBadges(User $user): array
    {
        $allBadges = Badge::where('is_active', true)->get();
        $userBadges = $user->badges()->get()->keyBy('id');

        return $allBadges->map(function ($badge) use ($userBadges) {
            $userBadge = $userBadges->get($badge->id);

            return [
                'id' => $badge->id,
                'slug' => $badge->slug,
                'name' => $badge->name,
                'description' => $badge->description,
                'icon' => $badge->icon,
                'color' => $badge->color,
                'rarity' => $badge->rarity,
                'rarity_color' => $badge->rarity_color,
                'points' => $badge->points,
                'progress' => $userBadge?->pivot->progress ?? 0,
                'awarded_at' => $userBadge?->pivot->awarded_at,
                'is_awarded' => $userBadge?->pivot->awarded_at !== null,
            ];
        })->toArray();
    }
}
