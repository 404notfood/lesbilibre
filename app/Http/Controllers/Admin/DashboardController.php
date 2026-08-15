<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\GemTransaction;
use App\Models\Like;
use App\Models\Photo;
use App\Models\Report;
use App\Models\Subscription;
use App\Models\User;
use App\Models\UserMatch;
use App\Models\VerificationPhoto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index(Request $request): Response
    {
        // User statistics
        $totalUsers = User::count();
        $activeToday = User::where('last_activity_at', '>=', now()->subDay())->count();
        $activeThisWeek = User::where('last_activity_at', '>=', now()->subWeek())->count();
        $activeThisMonth = User::where('last_activity_at', '>=', now()->subMonth())->count();
        $newUsersToday = User::whereDate('created_at', today())->count();
        $newUsersThisWeek = User::where('created_at', '>=', now()->subWeek())->count();
        $newUsersThisMonth = User::where('created_at', '>=', now()->subMonth())->count();

        // Semaine précédente, pour donner un sens aux chiffres de la semaine.
        $newUsersPreviousWeek = User::whereBetween('created_at', [
            now()->subWeeks(2),
            now()->subWeek(),
        ])->count();
        $premiumUsers = User::where('is_premium', true)->count();
        $verifiedUsers = User::where('is_verified', true)->count();
        $bannedUsers = User::where('is_banned', true)->count();

        // Engagement statistics
        $totalMatches = UserMatch::count();
        $matchesToday = UserMatch::whereDate('created_at', today())->count();
        $matchesThisWeek = UserMatch::where('created_at', '>=', now()->subWeek())->count();
        $matchesPreviousWeek = UserMatch::whereBetween('created_at', [
            now()->subWeeks(2),
            now()->subWeek(),
        ])->count();
        $messagesThisWeek = DB::table('messages')->where('created_at', '>=', now()->subWeek())->count();
        $messagesPreviousWeek = DB::table('messages')->whereBetween('created_at', [
            now()->subWeeks(2),
            now()->subWeek(),
        ])->count();
        $totalLikes = Like::count();
        $likesToday = Like::whereDate('created_at', today())->count();
        $totalMessages = DB::table('messages')->count();
        $messagesToday = DB::table('messages')->whereDate('created_at', today())->count();
        $totalConversations = Conversation::count();

        // Content moderation
        $pendingPhotos = Photo::where('is_approved', false)->whereNull('rejection_reason')->count();
        $pendingVerifications = VerificationPhoto::where('status', 'pending')->count();
        $openReports = Report::where('status', 'pending')->count();

        // Revenue statistics
        $totalRevenue = Subscription::where('status', 'active')->sum('amount');
        $revenueThisMonth = Subscription::where('status', 'active')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('amount');
        $activeSubscriptions = Subscription::where('status', 'active')
            ->where('current_period_end', '>', now())
            ->count();

        // Gems statistics
        $totalGemsDistributed = GemTransaction::where('type', 'purchase')->sum('amount');
        $totalGemsSpent = GemTransaction::where('type', 'expense')->sum('amount');
        $gemsRevenueThisMonth = GemTransaction::where('type', 'purchase')
            ->where('created_at', '>=', now()->startOfMonth())
            ->sum('price');

        // User growth chart data (last 30 days), zero-filled so the curve has
        // one point per day even when nobody signed up.
        $signupsByDay = User::select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->groupBy('date')
            ->pluck('count', 'date');

        $userGrowth = collect(range(29, 0))->map(function ($daysAgo) use ($signupsByDay) {
            $date = now()->subDays($daysAgo)->format('Y-m-d');

            return [
                'date' => $date,
                'count' => (int) ($signupsByDay[$date] ?? 0),
            ];
        })->values();

        // Activity chart data (last 7 days) — grouped once per metric instead
        // of one query per day and per metric.
        $since = now()->subDays(6)->startOfDay();
        $matchesByDay = $this->countByDay(UserMatch::query(), $since);
        $likesByDay = $this->countByDay(Like::query(), $since);
        $messagesByDay = $this->countByDay(DB::table('messages'), $since);

        $activityData = collect(range(6, 0))->map(function ($daysAgo) use ($matchesByDay, $likesByDay, $messagesByDay) {
            $date = now()->subDays($daysAgo)->format('Y-m-d');

            return [
                'date' => $date,
                'matches' => (int) ($matchesByDay[$date] ?? 0),
                'likes' => (int) ($likesByDay[$date] ?? 0),
                'messages' => (int) ($messagesByDay[$date] ?? 0),
            ];
        })->values();

        // Recent reports
        $recentReports = Report::with(['reporter', 'reportedUser'])
            ->where('status', 'pending')
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($report) => [
                'id' => $report->id,
                'reporter' => $report->reporter->name,
                'reported' => $report->reportedUser->name,
                'reported_id' => $report->reported_user_id,
                'reason' => $report->reason,
                'created_at' => $report->created_at->diffForHumans(),
            ]);

        // Recent users
        $recentUsers = User::with('profile')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_premium' => $user->is_premium,
                'is_verified' => $user->is_verified,
                'is_banned' => $user->is_banned,
                'created_at' => $user->created_at->diffForHumans(),
                'city' => $user->profile->city ?? null,
            ]);

        return Inertia::render('Admin/Dashboard/Index', [
            'stats' => [
                'users' => [
                    'total' => $totalUsers,
                    'active_today' => $activeToday,
                    'active_week' => $activeThisWeek,
                    'active_month' => $activeThisMonth,
                    'new_today' => $newUsersToday,
                    'new_week' => $newUsersThisWeek,
                    'new_previous_week' => $newUsersPreviousWeek,
                    'new_month' => $newUsersThisMonth,
                    'premium' => $premiumUsers,
                    'verified' => $verifiedUsers,
                    'banned' => $bannedUsers,
                ],
                'engagement' => [
                    'total_matches' => $totalMatches,
                    'matches_today' => $matchesToday,
                    'matches_week' => $matchesThisWeek,
                    'matches_previous_week' => $matchesPreviousWeek,
                    'total_likes' => $totalLikes,
                    'likes_today' => $likesToday,
                    'total_messages' => $totalMessages,
                    'messages_today' => $messagesToday,
                    'messages_week' => $messagesThisWeek,
                    'messages_previous_week' => $messagesPreviousWeek,
                    'total_conversations' => $totalConversations,
                ],
                'moderation' => [
                    'pending_photos' => $pendingPhotos,
                    'pending_verifications' => $pendingVerifications,
                    'open_reports' => $openReports,
                ],
                'revenue' => [
                    'total' => $totalRevenue,
                    'this_month' => $revenueThisMonth,
                    'active_subscriptions' => $activeSubscriptions,
                    'gems_distributed' => $totalGemsDistributed,
                    'gems_spent' => $totalGemsSpent,
                    'gems_revenue_month' => $gemsRevenueThisMonth,
                ],
            ],
            'charts' => [
                'user_growth' => $userGrowth,
                'activity' => $activityData,
            ],
            'recent_reports' => $recentReports,
            'recent_users' => $recentUsers,
        ]);
    }

    /**
     * Compte les enregistrements par jour depuis une date, en une seule requête.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<*>|\Illuminate\Database\Query\Builder  $query
     * @return \Illuminate\Support\Collection<string, int>
     */
    private function countByDay($query, \Carbon\CarbonInterface $since): \Illuminate\Support\Collection
    {
        return $query
            ->where('created_at', '>=', $since)
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(*) as aggregate'))
            ->groupBy('date')
            ->pluck('aggregate', 'date');
    }
}
