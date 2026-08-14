<?php

namespace App\Services;

use App\Models\GemTransaction;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class GemService
{
    /**
     * Add gems to a user's balance
     */
    public function addGems(
        User $user,
        int $amount,
        string $type,
        string $reason,
        ?string $description = null,
        ?array $metadata = null
    ): GemTransaction {
        return DB::transaction(function () use ($user, $amount, $type, $reason, $description, $metadata) {
            // Update user's gem balance
            $user->increment('gems', $amount);
            $user->refresh();

            // Create transaction record
            return GemTransaction::create([
                'user_id' => $user->id,
                'amount' => $amount,
                'balance_after' => $user->gems,
                'type' => $type,
                'reason' => $reason,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        });
    }

    /**
     * Deduct gems from a user's balance
     */
    public function deductGems(
        User $user,
        int $amount,
        string $type,
        string $reason,
        ?string $description = null,
        ?array $metadata = null
    ): ?GemTransaction {
        if (! $this->hasEnoughGems($user, $amount)) {
            return null;
        }

        return DB::transaction(function () use ($user, $amount, $type, $reason, $description, $metadata) {
            // Update user's gem balance
            $user->decrement('gems', $amount);
            $user->refresh();

            // Create transaction record (negative amount for spending)
            return GemTransaction::create([
                'user_id' => $user->id,
                'amount' => -$amount,
                'balance_after' => $user->gems,
                'type' => $type,
                'reason' => $reason,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        });
    }

    /**
     * Check if user has enough gems
     */
    public function hasEnoughGems(User $user, int $amount): bool
    {
        return $user->gems >= $amount;
    }

    /**
     * Grant daily login bonus
     */
    public function grantDailyLoginBonus(User $user): ?GemTransaction
    {
        // Check if user already received bonus today
        $lastBonus = GemTransaction::where('user_id', $user->id)
            ->where('reason', 'daily_login')
            ->whereDate('created_at', today())
            ->first();

        if ($lastBonus) {
            return null;
        }

        $amount = (int) Setting::get('gems_reward_daily_login', 5);

        return $this->addGems(
            $user,
            $amount,
            'earn',
            'daily_login',
            'Bonus de connexion quotidienne'
        );
    }

    /**
     * Grant profile completion bonus
     */
    public function grantProfileCompletionBonus(User $user): ?GemTransaction
    {
        // Check if user already received this bonus
        $alreadyGranted = GemTransaction::where('user_id', $user->id)
            ->where('reason', 'profile_completion')
            ->exists();

        if ($alreadyGranted) {
            return null;
        }

        // Check if profile is 100% complete
        if (! $this->isProfileComplete($user)) {
            return null;
        }

        $amount = (int) Setting::get('gems_reward_profile_completion', 50);

        return $this->addGems(
            $user,
            $amount,
            'earn',
            'profile_completion',
            'Bonus profil complété à 100%'
        );
    }

    /**
     * Grant first match bonus
     */
    public function grantFirstMatchBonus(User $user): ?GemTransaction
    {
        // Check if user already received this bonus
        $alreadyGranted = GemTransaction::where('user_id', $user->id)
            ->where('reason', 'first_match')
            ->exists();

        if ($alreadyGranted) {
            return null;
        }

        $amount = (int) Setting::get('gems_reward_first_match', 10);

        return $this->addGems(
            $user,
            $amount,
            'earn',
            'first_match',
            'Bonus pour ton premier match !'
        );
    }

    /**
     * Grant photo upload bonus
     */
    public function grantPhotoUploadBonus(User $user): ?GemTransaction
    {
        // Count how many photo upload bonuses user has received
        $bonusCount = GemTransaction::where('user_id', $user->id)
            ->where('reason', 'photo_upload')
            ->count();

        // Max 5 bonuses
        if ($bonusCount >= 5) {
            return null;
        }

        $amount = (int) Setting::get('gems_reward_photo_upload', 10);

        return $this->addGems(
            $user,
            $amount,
            'earn',
            'photo_upload',
            'Bonus pour ajout de photo ('.($bonusCount + 1).'/5)'
        );
    }

    /**
     * Charge gems for sending a message (non-Premium users)
     */
    public function chargeForMessage(User $user, int $messageId): ?GemTransaction
    {
        // Premium users send messages for free
        if ($user->isPremium()) {
            return null;
        }

        // Check if feature is enabled
        if (! Setting::get('require_gems_for_messages', false)) {
            return null;
        }

        $cost = (int) Setting::get('gems_cost_message', 1);

        return $this->deductGems(
            $user,
            $cost,
            'spend',
            'message_sent',
            'Envoi d\'un message',
            ['message_id' => $messageId]
        );
    }

    /**
     * Charge gems for sending a photo in chat (non-Premium users)
     */
    public function chargeForChatPhoto(User $user, int $messageId): ?GemTransaction
    {
        // Premium users send photos for free
        if ($user->isPremium()) {
            return null;
        }

        $cost = 5;

        return $this->deductGems(
            $user,
            $cost,
            'spend',
            'chat_photo',
            'Envoi d\'une photo dans le chat',
            ['message_id' => $messageId]
        );
    }

    /**
     * Charge gems for profile boost
     */
    public function chargeForBoost(User $user): ?GemTransaction
    {
        $cost = (int) Setting::get('gems_cost_boost', 20);

        return $this->deductGems(
            $user,
            $cost,
            'spend',
            'boost_profile',
            'Boost de profil (30 minutes)'
        );
    }

    /**
     * Charge gems for super like
     */
    public function chargeForSuperLike(User $user, int $targetUserId): ?GemTransaction
    {
        $cost = (int) Setting::get('gems_cost_super_like', 5);

        return $this->deductGems(
            $user,
            $cost,
            'spend',
            'super_like',
            'Super like envoyé',
            ['target_user_id' => $targetUserId]
        );
    }

    /**
     * Charge gems to reveal a like (non-Premium users)
     */
    public function chargeForRevealLike(User $user, int $likeId): ?GemTransaction
    {
        // Premium users can see all likes for free
        if ($user->isPremium()) {
            return null;
        }

        $cost = (int) Setting::get('gems_cost_reveal_like', 2);

        return $this->deductGems(
            $user,
            $cost,
            'spend',
            'reveal_like',
            'Révéler un like',
            ['like_id' => $likeId]
        );
    }

    /**
     * Check if profile is complete
     */
    private function isProfileComplete(User $user): bool
    {
        $profile = $user->profile;

        if (! $profile) {
            return false;
        }

        // Check required fields
        $requiredFields = [
            'bio',
            'date_of_birth',
            'city',
            'sexual_orientation',
            'looking_for',
        ];

        foreach ($requiredFields as $field) {
            if (empty($profile->$field)) {
                return false;
            }
        }

        // Check if user has at least one photo
        if ($user->photos()->count() === 0) {
            return false;
        }

        return true;
    }

    /**
     * Get user's gem transaction history
     */
    public function getTransactionHistory(User $user, int $limit = 50)
    {
        return GemTransaction::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get();
    }
}
