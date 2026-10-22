<?php

namespace App\Http\Controllers;

use App\Services\MatchingService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchController extends Controller
{
    public function __construct(
        protected MatchingService $matchingService
    ) {}

    /**
     * Show all matches for the current user.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $matches = \App\Models\UserMatch::query()
            ->where(fn ($query) => $query->where('user1_id', $user->id)->orWhere('user2_id', $user->id))
            ->with(['user1.profile', 'user1.photos', 'user2.profile', 'user2.photos'])
            ->latest('matched_at')
            ->get()
            ->filter(function ($match) use ($user) {
                $other = $match->user1_id === $user->id ? $match->user2 : $match->user1;

                return $other && $user->canInteractWith($other);
            })
            ->map(function ($match) use ($user) {
                $other = $match->user1_id === $user->id ? $match->user2 : $match->user1;

                return [
                    'id' => $match->id,
                    'matched_at' => $match->matched_at?->toISOString(),
                    'user' => $other->publicCommunityData(),
                ];
            })->values();

        return Inertia::render('Matches/Index', [
            'matches' => $matches,
        ]);
    }

    /**
     * Show recommended profiles based on preferences.
     */
    public function recommendations(Request $request): Response
    {
        $user = $request->user();

        $recommendations = $this->matchingService->getRecommendations($user, 20)
            ->map(fn ($member) => $member->publicCommunityData());

        return Inertia::render('Matches/Recommendations', [
            'recommendations' => $recommendations,
        ]);
    }
}
