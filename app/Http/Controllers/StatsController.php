<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\GemTransaction;
use App\Models\Message;
use App\Models\ProfileView;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StatsController extends Controller
{
    /**
     * Display advanced statistics (Premium only).
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Check if user is premium
        if (! $user->isPremium()) {
            return Inertia::render('Stats/Index', [
                'isPremium' => false,
            ]);
        }

        $receivedMessages = Message::where('sender_id', '!=', $user->id)
            ->whereHas('conversation', fn ($query) => $query
                ->where('user1_id', $user->id)
                ->orWhere('user2_id', $user->id));
        $conversations = Conversation::where('user1_id', $user->id)
            ->orWhere('user2_id', $user->id);
        $weekStart = now()->subDays(6)->startOfDay();

        $stats = [
            'profile_views' => [
                'total' => ProfileView::where('profile_user_id', $user->id)->count(),
                'this_week' => ProfileView::where('profile_user_id', $user->id)
                    ->where('viewed_on', '>=', now()->subDays(6)->toDateString())->count(),
                'this_month' => ProfileView::where('profile_user_id', $user->id)
                    ->where('viewed_on', '>=', now()->startOfMonth()->toDateString())->count(),
            ],

            // Likes statistics
            'likes' => [
                'given' => $user->likesGiven()->count(),
                'received' => $user->likesReceived()->count(),
                'ratio' => $user->likesReceived()->count() > 0
                    ? round($user->likesGiven()->count() / $user->likesReceived()->count(), 2)
                    : 0,
                'weekly_received' => $user->likesReceived()
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count(),
            ],

            // Matches
            'matches' => [
                'total' => $user->matches()->count(),
                'this_week' => $user->matches()
                    ->where('matched_at', '>=', now()->subDays(7))
                    ->count(),
                'this_month' => $user->matches()
                    ->where('matched_at', '>=', now()->subDays(30))
                    ->count(),
            ],

            // Messages
            'messages' => [
                'sent' => $user->messagesSent()->count(),
                'received' => $receivedMessages->count(),
                'conversations' => $conversations->count(),
                'avg_response_time' => '—',
            ],

            // Activity
            'activity' => [
                'daily_likes_remaining' => 'Illimité',
                'badges_earned' => $user->badges()->whereNotNull('user_badges.awarded_at')->count(),
                'gems' => $user->gems,
                'total_gifts_received' => GemTransaction::where('user_id', $user->id)
                    ->where('reason', 'gift_received')->count(),
            ],

            'weekly_performance' => collect(range(0, 6))->map(function (int $offset) use ($user, $weekStart) {
                $date = $weekStart->copy()->addDays($offset);

                return [
                    'day' => $date->isoFormat('ddd'),
                    'likes' => $user->likesReceived()->whereDate('created_at', $date)->count(),
                    'matches' => $user->matches()->whereDate('matched_at', $date)->count(),
                ];
            })->all(),
        ];

        return Inertia::render('Stats/Index', [
            'isPremium' => true,
            'stats' => $stats,
        ]);
    }
}
