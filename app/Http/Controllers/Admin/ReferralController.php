<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    public function index(): Response
    {
        $referrals = Referral::query()
            ->with([
                'referrer:id,pseudo,email',
                'referredUser:id,pseudo,email,is_verified',
            ])
            ->latest()
            ->paginate(50)
            ->through(fn (Referral $referral) => [
                'id' => $referral->id,
                'status' => $referral->status,
                'code' => $referral->code,
                'referrer_reward' => $referral->referrer_reward,
                'referred_reward' => $referral->referred_reward,
                'created_at' => $referral->created_at->toISOString(),
                'rewarded_at' => $referral->rewarded_at?->toISOString(),
                'referrer' => $referral->referrer,
                'referred_user' => $referral->referredUser,
            ]);

        $totals = Referral::query()
            ->selectRaw('COUNT(*) as total')
            ->selectRaw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as pending', [Referral::STATUS_PENDING])
            ->selectRaw('SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) as rewarded', [Referral::STATUS_REWARDED])
            ->selectRaw('COALESCE(SUM(referrer_reward + referred_reward), 0) as gems_distributed')
            ->first();

        $monthly = Referral::query()
            ->where('created_at', '>=', now()->subMonths(5)->startOfMonth())
            ->get(['created_at'])
            ->groupBy(fn (Referral $referral) => $referral->created_at->format('Y-m'))
            ->map(fn ($items, string $month) => [
                'month' => $month,
                'total' => $items->count(),
            ])
            ->values();

        return Inertia::render('Admin/Referrals/Index', [
            'referrals' => $referrals,
            'stats' => [
                'total' => (int) ($totals?->total ?? 0),
                'pending' => (int) ($totals?->pending ?? 0),
                'rewarded' => (int) ($totals?->rewarded ?? 0),
                'gems_distributed' => (int) ($totals?->gems_distributed ?? 0),
            ],
            'monthly' => $monthly,
        ]);
    }
}
