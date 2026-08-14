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

        $matches = $this->matchingService->getUserMatches($user);

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

        $recommendations = $this->matchingService->getRecommendations($user, 20);

        return Inertia::render('Matches/Recommendations', [
            'recommendations' => $recommendations,
        ]);
    }
}
