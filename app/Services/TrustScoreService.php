<?php

namespace App\Services;

use App\Models\TrustScoreLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class TrustScoreService
{
    /**
     * Calculate the trust score for a user.
     */
    public function calculateScore(User $user): int
    {
        $score = 0;

        // Verification: +25
        if ($user->is_verified) {
            $score += 25;
        }

        // Account age: +1 per month, max +15
        $monthsActive = $user->created_at->diffInMonths(now());
        $score += min($monthsActive, 15);

        // Profile completion: +10
        if ($this->isProfileComplete($user)) {
            $score += 10;
        }

        // Photos approved: +1 per photo, max +10
        $approvedPhotos = $user->photos()->where('is_approved', true)->count();
        $score += min($approvedPhotos, 10);

        // Reports received (pending or actioned, last 90 days): -5 each
        $reportsCount = $user->reportsReceived()
            ->whereIn('status', ['pending', 'reviewed'])
            ->where('created_at', '>=', now()->subDays(90))
            ->count();
        $score -= $reportsCount * 5;

        // Reports resolved as false positives (vindication): +2 each
        $falsePositives = $user->reportsReceived()
            ->where('status', 'dismissed')
            ->count();
        $score += min($falsePositives * 2, 10);

        // Premium status: +5
        if ($user->isPremium()) {
            $score += 5;
        }

        // Probation passed cleanly: +5
        if ($user->is_on_probation === false &&
            $user->probation_ends_at !== null &&
            $user->probation_ends_at->isPast()) {
            $score += 5;
        }

        // Badge points: +1 per 10 badge points, max +5
        $badgePoints = $user->badge_points ?? 0;
        $score += min(intdiv($badgePoints, 10), 5);

        // Clamp to 0-100
        return max(0, min($score, 100));
    }

    /**
     * Refresh the trust score for a user and log changes.
     */
    public function refreshScore(User $user): void
    {
        $previousScore = $user->trust_score ?? 0;
        $newScore = $this->calculateScore($user);

        if ($previousScore === $newScore) {
            return;
        }

        $reason = $this->determineReason($user, $previousScore, $newScore);

        DB::transaction(function () use ($user, $previousScore, $newScore, $reason) {
            $user->forceFill([
                'trust_score' => $newScore,
                'trust_score_updated_at' => now(),
            ])->save();

            TrustScoreLog::create([
                'user_id' => $user->id,
                'previous_score' => $previousScore,
                'new_score' => $newScore,
                'reason' => $reason,
                'points_change' => $newScore - $previousScore,
            ]);
        });
    }

    /**
     * Get the trust level info based on score.
     */
    public function getTrustLevel(int $score): array
    {
        return match (true) {
            $score >= 76 => [
                'level' => 'excellence',
                'label' => 'Excellence',
                'color' => '#10B981',
                'icon' => 'shield-check',
            ],
            $score >= 51 => [
                'level' => 'very_trusted',
                'label' => 'Tres fiable',
                'color' => '#3B82F6',
                'icon' => 'shield',
            ],
            $score >= 26 => [
                'level' => 'trusted',
                'label' => 'Fiable',
                'color' => '#F59E0B',
                'icon' => 'shield',
            ],
            default => [
                'level' => 'new',
                'label' => 'Nouveau',
                'color' => '#6B7280',
                'icon' => 'shield',
            ],
        };
    }

    /**
     * Get a detailed breakdown of the trust score.
     */
    public function getBreakdown(User $user): array
    {
        $breakdown = [];

        // Verification
        $verificationPoints = $user->is_verified ? 25 : 0;
        $breakdown[] = [
            'category' => 'Verification',
            'points' => $verificationPoints,
            'max' => 25,
            'label' => $user->is_verified ? 'Profil verifie' : 'Non verifie',
        ];

        // Account age
        $monthsActive = $user->created_at->diffInMonths(now());
        $agePoints = min($monthsActive, 15);
        $breakdown[] = [
            'category' => 'Anciennete',
            'points' => $agePoints,
            'max' => 15,
            'label' => $monthsActive.' mois sur la plateforme',
        ];

        // Profile completion
        $profilePoints = $this->isProfileComplete($user) ? 10 : 0;
        $breakdown[] = [
            'category' => 'Profil',
            'points' => $profilePoints,
            'max' => 10,
            'label' => $profilePoints > 0 ? 'Profil complet' : 'Profil incomplet',
        ];

        // Photos
        $approvedPhotos = $user->photos()->where('is_approved', true)->count();
        $photoPoints = min($approvedPhotos, 10);
        $breakdown[] = [
            'category' => 'Photos',
            'points' => $photoPoints,
            'max' => 10,
            'label' => $approvedPhotos.' photo(s) approuvee(s)',
        ];

        // Reports
        $reportsCount = $user->reportsReceived()
            ->whereIn('status', ['pending', 'reviewed'])
            ->where('created_at', '>=', now()->subDays(90))
            ->count();
        $reportPoints = -($reportsCount * 5);
        $breakdown[] = [
            'category' => 'Signalements',
            'points' => $reportPoints,
            'max' => 0,
            'label' => $reportsCount > 0 ? $reportsCount.' signalement(s) actif(s)' : 'Aucun signalement',
        ];

        // Premium
        $premiumPoints = $user->isPremium() ? 5 : 0;
        $breakdown[] = [
            'category' => 'Premium',
            'points' => $premiumPoints,
            'max' => 5,
            'label' => $user->isPremium() ? 'Membre Premium' : 'Membre gratuit',
        ];

        // Badge points
        $badgePoints = $user->badge_points ?? 0;
        $badgeScorePoints = min(intdiv($badgePoints, 10), 5);
        $breakdown[] = [
            'category' => 'Badges',
            'points' => $badgeScorePoints,
            'max' => 5,
            'label' => $badgePoints.' points de badges',
        ];

        return $breakdown;
    }

    /**
     * Check if user profile is complete.
     */
    protected function isProfileComplete(User $user): bool
    {
        $profile = $user->profile;

        if (! $profile) {
            return false;
        }

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

        return $user->photos()->where('is_approved', true)->exists();
    }

    /**
     * Determine the main reason for score change.
     */
    protected function determineReason(User $user, int $previousScore, int $newScore): string
    {
        if ($newScore > $previousScore) {
            if ($user->is_verified && $previousScore < 25) {
                return 'verification';
            }

            return 'score_increase';
        }

        return 'score_decrease';
    }
}
