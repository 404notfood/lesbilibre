<?php

namespace App\Http\Controllers;

use App\Services\BadgeService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BadgeController extends Controller
{
    public function __construct(protected BadgeService $badgeService) {}

    /**
     * Display user's badges.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Check and award new badges
        $this->badgeService->checkAndAwardBadges($user);

        // Get all badges with progress
        $badges = $this->badgeService->getUserBadges($user);

        // Group badges by rarity
        $badgesByRarity = collect($badges)->groupBy('rarity');

        // Calculate statistics
        $stats = [
            'total_badges' => count($badges),
            'earned_badges' => collect($badges)->where('is_awarded', true)->count(),
            'total_points' => $user->badge_points,
            'progress_percentage' => count($badges) > 0
                ? round((collect($badges)->where('is_awarded', true)->count() / count($badges)) * 100)
                : 0,
        ];

        return Inertia::render('Badges/Index', [
            'badges' => $badges,
            'badgesByRarity' => $badgesByRarity,
            'stats' => $stats,
        ]);
    }

    /**
     * Refresh user's badges (check for new earned badges).
     */
    public function refresh(Request $request)
    {
        $user = $request->user();

        $newlyAwarded = $this->badgeService->checkAndAwardBadges($user);

        return response()->json([
            'message' => count($newlyAwarded) > 0
                ? 'Nouveaux badges obtenus !'
                : 'Aucun nouveau badge pour le moment',
            'newly_awarded' => $newlyAwarded->map(fn ($badge) => [
                'id' => $badge->id,
                'name' => $badge->name,
                'icon' => $badge->icon,
                'points' => $badge->points,
            ]),
        ]);
    }
}
