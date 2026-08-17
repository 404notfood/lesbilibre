<?php

namespace App\Services;

use App\Models\Referral;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ReferralService
{
    private const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public function __construct(
        private GemService $gemService,
        private NotificationService $notificationService,
    ) {}

    public function ensureReferralCode(User $user): string
    {
        if (filled($user->referral_code)) {
            return $user->referral_code;
        }

        for ($attempt = 0; $attempt < 10; $attempt++) {
            $code = $this->generateCode();

            if (User::withTrashed()->where('referral_code', $code)->exists()) {
                continue;
            }

            $user->forceFill(['referral_code' => $code])->save();

            return $code;
        }

        throw new RuntimeException('Impossible de générer un code de parrainage unique.');
    }

    public function attributeReferral(User $referredUser, ?string $code): ?Referral
    {
        if (! config('referrals.enabled') || blank($code)) {
            return null;
        }

        $normalizedCode = mb_strtoupper(trim($code));
        $referrer = User::query()->where('referral_code', $normalizedCode)->first();

        if ($referrer === null || $referrer->is($referredUser)) {
            return null;
        }

        return Referral::query()->firstOrCreate(
            ['referred_user_id' => $referredUser->id],
            [
                'referrer_id' => $referrer->id,
                'code' => $normalizedCode,
                'status' => Referral::STATUS_PENDING,
            ],
        );
    }

    public function rewardVerifiedUser(User $referredUser): ?Referral
    {
        if (! config('referrals.enabled') || ! $referredUser->is_verified) {
            return null;
        }

        return DB::transaction(function () use ($referredUser): ?Referral {
            $referral = Referral::query()
                ->where('referred_user_id', $referredUser->id)
                ->lockForUpdate()
                ->first();

            if ($referral === null || $referral->status === Referral::STATUS_REWARDED) {
                return $referral;
            }

            $referrer = User::query()->lockForUpdate()->find($referral->referrer_id);
            $referred = User::query()->lockForUpdate()->find($referral->referred_user_id);

            if ($referrer === null || $referred === null || $referrer->is_banned || $referred->is_banned) {
                return null;
            }

            $referrerReward = max(0, (int) config('referrals.referrer_reward'));
            $referredReward = max(0, (int) config('referrals.referred_reward'));

            if ($referrerReward > 0) {
                $this->gemService->addGems(
                    $referrer,
                    $referrerReward,
                    'reward',
                    'referral_reward',
                    'Récompense de parrainage',
                    ['referral_id' => $referral->id, 'referred_user_id' => $referred->id],
                );
            }

            if ($referredReward > 0) {
                $this->gemService->addGems(
                    $referred,
                    $referredReward,
                    'reward',
                    'referral_welcome_reward',
                    'Bonus de bienvenue parrainage',
                    ['referral_id' => $referral->id, 'referrer_id' => $referrer->id],
                );
            }

            $referral->update([
                'status' => Referral::STATUS_REWARDED,
                'referrer_reward' => $referrerReward,
                'referred_reward' => $referredReward,
                'qualified_at' => now(),
                'rewarded_at' => now(),
            ]);

            $this->notificationService->notifyReferralReward(
                $referrer,
                $referred,
                $referrerReward,
                $referral,
            );

            return $referral->fresh();
        }, attempts: 3);
    }

    private function generateCode(): string
    {
        $code = '';
        $lastIndex = strlen(self::CODE_ALPHABET) - 1;

        for ($index = 0; $index < 10; $index++) {
            $code .= self::CODE_ALPHABET[random_int(0, $lastIndex)];
        }

        return $code;
    }
}
