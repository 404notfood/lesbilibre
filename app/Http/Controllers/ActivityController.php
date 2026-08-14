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
        $recentLikes = Like::with(['liker.profile', 'liker.photos'])
            ->where('liked_user_id', $userId)
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($like) {
                $primaryPhoto = $like->liker->photos->where('is_primary', true)->first();

                return [
                    'id' => $like->id,
                    'type' => 'like',
                    'user' => [
                        'id' => $like->liker->id,
                        'name' => $like->liker->name,
                        'age' => $like->liker->profile->age ?? null,
                        'photo' => $primaryPhoto ? asset('storage/'.$primaryPhoto->path) : null,
                        'online' => $like->liker->is_online ?? false,
                    ],
                    'created_at' => $like->created_at->toISOString(),
                ];
            });

        $recentVisits = ProfileVisit::with(['visitor.profile', 'visitor.photos'])
            ->where('visited_user_id', $userId)
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($visit) {
                $primaryPhoto = $visit->visitor->photos->where('is_primary', true)->first();

                return [
                    'id' => $visit->id,
                    'type' => 'visit',
                    'user' => [
                        'id' => $visit->visitor->id,
                        'name' => $visit->visitor->name,
                        'age' => $visit->visitor->profile->age ?? null,
                        'photo' => $primaryPhoto ? asset('storage/'.$primaryPhoto->path) : null,
                        'online' => $visit->visitor->is_online ?? false,
                    ],
                    'created_at' => $visit->created_at->toISOString(),
                ];
            });

        $recentMatches = UserMatch::with(['user1.profile', 'user1.photos', 'user2.profile', 'user2.photos'])
            ->where(function ($query) use ($userId) {
                $query->where('user1_id', $userId)->orWhere('user2_id', $userId);
            })
            ->latest()
            ->limit(10)
            ->get()
            ->map(function ($match) use ($userId) {
                $otherUser = $match->user1_id == $userId ? $match->user2 : $match->user1;
                $primaryPhoto = $otherUser->photos->where('is_primary', true)->first();

                return [
                    'id' => $match->id,
                    'type' => 'match',
                    'user' => [
                        'id' => $otherUser->id,
                        'name' => $otherUser->name,
                        'age' => $otherUser->profile->age ?? null,
                        'photo' => $primaryPhoto ? asset('storage/'.$primaryPhoto->path) : null,
                        'online' => $otherUser->is_online ?? false,
                    ],
                    'created_at' => $match->created_at->toISOString(),
                ];
            });

        $activities = $recentLikes->concat($recentVisits)->concat($recentMatches)
            ->sortByDesc('created_at')
            ->take(20)
            ->values()
            ->toArray();

        // Temple de la renommée (top utilisateurs par nombre de likes)
        $hallOfFame = User::select('users.id', 'users.name', 'users.pseudo')
            ->selectRaw('COUNT(likes.id) as likes_count')
            ->with(['profile', 'photos' => function ($query) {
                $query->where('is_primary', true);
            }])
            ->join('likes', 'users.id', '=', 'likes.liked_user_id')
            ->where('users.id', '!=', $userId)
            ->groupBy('users.id', 'users.name', 'users.pseudo')
            ->orderByDesc('likes_count')
            ->limit(5)
            ->get()
            ->map(function ($user, $index) {
                $primaryPhoto = $user->photos->first();

                return [
                    'id' => $user->id,
                    'rank' => $index + 1,
                    'name' => $user->name,
                    'age' => $user->profile->age ?? null,
                    'photo' => $primaryPhoto ? asset('storage/'.$primaryPhoto->path) : null,
                    'likes_count' => $user->likes_count,
                ];
            })
            ->toArray();

        return Inertia::render('Activity/Index', [
            'likes_received' => $recentLikes->toArray(),
            'visits' => $recentVisits->toArray(),
            'matches' => $recentMatches->toArray(),
            'activities' => $activities,
            'top_users' => $hallOfFame,
        ]);
    }
}
