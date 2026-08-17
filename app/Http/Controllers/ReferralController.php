<?php

namespace App\Http\Controllers;

use App\Models\Referral;
use App\Services\ReferralService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    public function __construct(private ReferralService $referralService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $code = $this->referralService->ensureReferralCode($user);
        $referralsQuery = $user->referralsMade();

        $referrals = (clone $referralsQuery)
            ->with('referredUser:id,pseudo')
            ->latest()
            ->paginate(20)
            ->through(fn (Referral $referral) => [
                'id' => $referral->id,
                'pseudo' => $referral->referredUser?->pseudo ?? 'Compte supprimé',
                'status' => $referral->status,
                'reward' => $referral->referrer_reward,
                'created_at' => $referral->created_at->toISOString(),
                'rewarded_at' => $referral->rewarded_at?->toISOString(),
            ]);

        return Inertia::render('Referrals/Index', [
            'program' => [
                'enabled' => (bool) config('referrals.enabled'),
                'code' => $code,
                'url' => route('register', ['ref' => $code]),
                'referrer_reward' => (int) config('referrals.referrer_reward'),
                'referred_reward' => (int) config('referrals.referred_reward'),
            ],
            'stats' => [
                'total' => (clone $referralsQuery)->count(),
                'pending' => (clone $referralsQuery)->where('status', Referral::STATUS_PENDING)->count(),
                'rewarded' => (clone $referralsQuery)->where('status', Referral::STATUS_REWARDED)->count(),
                'gems_earned' => (clone $referralsQuery)->sum('referrer_reward'),
            ],
            'referrals' => $referrals,
        ]);
    }
}
