<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Message;
use App\Models\ProfileVisit;
use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityController extends Controller
{
    /**
     * Display user activity dashboard.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $userId = $user->id;

        // Statistiques réelles
        $likesReceived = Like::where('liked_user_id', $userId)->count();
        $likesReceivedLastWeek = Like::where('liked_user_id', $userId)
            ->where('created_at', '>=', now()->subWeek())
            ->count();
        $likesReceivedTwoWeeksAgo = Like::where('liked_user_id', $userId)
            ->whereBetween('created_at', [now()->subWeeks(2), now()->subWeek()])
            ->count();
        $likesTrend = $likesReceivedTwoWeeksAgo > 0
            ? round((($likesReceivedLastWeek - $likesReceivedTwoWeeksAgo) / $likesReceivedTwoWeeksAgo) * 100)
            : ($likesReceivedLastWeek > 0 ? 100 : 0);

        $profileVisits = ProfileVisit::where('visited_user_id', $userId)->count();
        $visitsLastWeek = ProfileVisit::where('visited_user_id', $userId)
            ->where('created_at', '>=', now()->subWeek())
            ->count();
        $visitsTwoWeeksAgo = ProfileVisit::where('visited_user_id', $userId)
            ->whereBetween('created_at', [now()->subWeeks(2), now()->subWeek()])
            ->count();
        $visitsTrend = $visitsTwoWeeksAgo > 0
            ? round((($visitsLastWeek - $visitsTwoWeeksAgo) / $visitsTwoWeeksAgo) * 100)
            : ($visitsLastWeek > 0 ? 100 : 0);

        $matches = UserMatch::where(function ($query) use ($userId) {
            $query->where('user1_id', $userId)->orWhere('user2_id', $userId);
        })->count();
        $matchesThisMonth = UserMatch::where(function ($query) use ($userId) {
            $query->where('user1_id', $userId)->orWhere('user2_id', $userId);
        })->where('created_at', '>=', now()->startOfMonth())->count();
        $matchesLastMonth = UserMatch::where(function ($query) use ($userId) {
            $query->where('user1_id', $userId)->orWhere('user2_id', $userId);
        })
            ->whereBetween('created_at', [now()->subMonth()->startOfMonth(), now()->subMonth()->endOfMonth()])
            ->count();
        $matchesTrend = $matchesThisMonth - $matchesLastMonth;

        $totalMessages = Message::whereHas('conversation', function ($query) use ($userId) {
            $query->where('user1_id', $userId)->orWhere('user2_id', $userId);
        })->count();
        $messagesToday = Message::whereHas('conversation', function ($query) use ($userId) {
            $query->where('user1_id', $userId)->orWhere('user2_id', $userId);
        })->where('created_at', '>=', now()->startOfDay())->count();

        // Activités récentes combinées (visites, likes, matches)
        $recentLikes = Like::with(['liker.profile', 'liker.avatarPhoto'])
            ->where('liked_user_id', $userId)
            ->latest()
            ->limit(20)
            ->get()
            ->filter(fn ($like) => $like->liker && $user->canInteractWith($like->liker))
            ->map(function ($like) {

                return [
                    'id' => $like->id,
                    'type' => 'like',
                    'user' => [
                        'id' => $like->liker->id,
                        'name' => $like->liker->pseudo,
                        'age' => $like->liker->profile?->show_age ? $like->liker->profile->age : null,
                        'photo' => $like->liker->avatarPhoto?->viewUrl(thumbnail: true),
                        'online' => $like->liker->is_online ?? false,
                    ],
                    'created_at' => $like->created_at->toISOString(),
                ];
            })->values();

        $recentVisits = ProfileVisit::with(['visitor.profile', 'visitor.avatarPhoto'])
            ->where('visited_user_id', $userId)
            ->latest()
            ->limit(20)
            ->get()
            ->filter(fn ($visit) => $visit->visitor && $user->canInteractWith($visit->visitor))
            ->map(function ($visit) {

                return [
                    'id' => $visit->id,
                    'type' => 'visit',
                    'user' => [
                        'id' => $visit->visitor->id,
                        'name' => $visit->visitor->pseudo,
                        'age' => $visit->visitor->profile?->show_age ? $visit->visitor->profile->age : null,
                        'photo' => $visit->visitor->avatarPhoto?->viewUrl(thumbnail: true),
                        'online' => $visit->visitor->is_online ?? false,
                    ],
                    'created_at' => $visit->created_at->toISOString(),
                ];
            })->values();

        $recentMatches = UserMatch::with(['user1.profile', 'user1.avatarPhoto', 'user2.profile', 'user2.avatarPhoto'])
            ->where(function ($query) use ($userId) {
                $query->where('user1_id', $userId)->orWhere('user2_id', $userId);
            })
            ->latest()
            ->limit(10)
            ->get()
            ->filter(function ($match) use ($userId, $user) {
                $other = $match->user1_id == $userId ? $match->user2 : $match->user1;

                return $other && $user->canInteractWith($other);
            })
            ->map(function ($match) use ($userId) {
                $otherUser = $match->user1_id == $userId ? $match->user2 : $match->user1;

                return [
                    'id' => $match->id,
                    'type' => 'match',
                    'user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->pseudo,
                        'age' => $otherUser->profile?->show_age ? $otherUser->profile->age : null,
                        'photo' => $otherUser->avatarPhoto?->viewUrl(thumbnail: true),
                        'online' => $otherUser->is_online ?? false,
                    ],
                    'created_at' => $match->created_at->toISOString(),
                ];
            })->values();

        $activities = $recentLikes->concat($recentVisits)->concat($recentMatches)
            ->sortByDesc('created_at')
            ->take(20)
            ->values()
            ->toArray();

        // Temple de la renommée (top utilisateurs par nombre de likes)
        // Count in a subquery so selecting users.* also works with MySQL's ONLY_FULL_GROUP_BY.
        $hallOfFame = User::query()
            ->withCount('likesReceived as likes_count')
            ->with(['profile', 'avatarPhoto'])
            ->has('likesReceived')
            ->where('users.id', '!=', $userId)
            ->communityEligible()
            ->orderByDesc('likes_count')
            ->limit(5)
            ->get()
            ->filter(fn ($candidate) => $user->canInteractWith($candidate))
            ->values()
            ->map(function ($user, $index) {

                return [
                    'id' => $user->id,
                    'rank' => $index + 1,
                    'name' => $user->pseudo,
                    'age' => $user->profile?->show_age ? $user->profile->age : null,
                    'photo' => $user->avatarPhoto?->viewUrl(thumbnail: true),
                    'likes_count' => $user->likes_count,
                ];
            })
            ->toArray();

        // Marquer l'activité comme vue une fois les données collectées : la
        // pastille retombe à zéro, mais la page affiche encore ce qui était
        // nouveau au moment de l'ouverture.
        $user->forceFill(['activity_seen_at' => now()])->saveQuietly();

        return Inertia::render('Activity/Index', [
            'likes_received' => $recentLikes->toArray(),
            'visits' => $recentVisits->toArray(),
            'matches' => $recentMatches->toArray(),
            'activities' => $activities,
            'top_users' => $hallOfFame,
        ]);
    }
}
