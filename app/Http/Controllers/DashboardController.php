<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\ProfileVisit;
use App\Models\User;
use App\Services\MatchScoreService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(protected MatchScoreService $matchScoreService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        $userProfile = $user->profile;

        // Get search filters
        $filters = [
            'search' => $request->input('search'),
            'min_age' => $request->input('min_age', $userProfile?->min_age_preference ?? 18),
            'max_age' => $request->input('max_age', $userProfile?->max_age_preference ?? 99),
            'search_radius' => $request->input('search_radius', $userProfile?->search_radius ?? 50),
            'sort_by' => $request->input('sort_by', 'distance'), // distance, recent, compatibility
            'quick_filter' => $request->input('quick_filter'), // nearby, online, new, photos
        ];

        // Build query
        $query = User::with(['profile', 'photos' => function ($q) {
            $q->where('is_approved', true)
                ->orderByDesc('is_primary')
                ->orderBy('order');
        }])
            ->where('users.id', '!=', $user->id)
            ->where('users.is_verified', true)
            ->where('users.is_banned', false)
            ->whereHas('profile', fn ($profile) => $profile->where('is_discoverable', true))
            // Exclure les utilisateurs bloqués
            ->whereNotIn('users.id', function ($subquery) use ($user) {
                $subquery->select('blocked_id')
                    ->from('blocked_users')
                    ->where('blocker_id', $user->id);
            })
            // Exclure les utilisateurs qui m'ont bloqué
            ->whereNotIn('users.id', function ($subquery) use ($user) {
                $subquery->select('blocker_id')
                    ->from('blocked_users')
                    ->where('blocked_id', $user->id);
            });

        // Search filter (name or city)
        if (! empty($filters['search'])) {
            $searchTerm = $filters['search'];
            $query->where(function ($q) use ($searchTerm) {
                $q->where('users.name', 'like', "%{$searchTerm}%")
                    ->orWhereHas('profile', function ($q2) use ($searchTerm) {
                        $q2->where('city', 'like', "%{$searchTerm}%");
                    });
            });
        }

        // Quick filters
        if (! empty($filters['quick_filter'])) {
            switch ($filters['quick_filter']) {
                case 'nearby':
                    // Override search radius to 10km for nearby filter
                    $filters['search_radius'] = 10;
                    // Force distance sorting
                    $filters['sort_by'] = 'distance';
                    break;
                case 'online':
                    $query->where('last_login_at', '>=', now()->subMinutes(15));
                    break;
                case 'new':
                    $query->where('users.created_at', '>=', now()->subDays(7));
                    break;
                case 'photos':
                    $query->has('photos');
                    break;
            }
        }

        // Age filter
        // On filtre sur date_of_birth : la colonne `age` est souvent NULL en base
        // et l'âge réel est recalculé par l'accesseur du modèle Profile.
        if ($filters['min_age'] || $filters['max_age']) {
            $query->whereHas('profile', function ($q) use ($filters) {
                if ($filters['min_age']) {
                    $q->whereDate('date_of_birth', '<=', now()->subYears((int) $filters['min_age'])->toDateString());
                }
                if ($filters['max_age']) {
                    $q->whereDate('date_of_birth', '>=', now()->subYears((int) $filters['max_age'] + 1)->toDateString());
                }
            });
        }

        // Distance filter (if user has coordinates)
        $hasCoordinates = $userProfile && $userProfile->latitude && $userProfile->longitude;

        if ($hasCoordinates) {
            $lat = (float) $userProfile->latitude;
            $lng = (float) $userProfile->longitude;
            $radius = (int) $filters['search_radius'];

            // Une seule jointure sur profiles : le calcul Haversine sert à la fois
            // à filtrer par rayon et à exposer la colonne `distance`.
            $haversine = '(6371 * acos(least(1, greatest(-1, '
                .'cos(radians(?)) * cos(radians(profiles.latitude)) '
                .'* cos(radians(profiles.longitude) - radians(?)) '
                .'+ sin(radians(?)) * sin(radians(profiles.latitude))'
                .'))))';

            $query->join('profiles', 'users.id', '=', 'profiles.user_id')
                ->select('users.*')
                ->selectRaw($haversine.' as distance', [$lat, $lng, $lat])
                ->whereNotNull('profiles.latitude')
                ->whereNotNull('profiles.longitude')
                ->whereRaw($haversine.' <= ?', [$lat, $lng, $lat, $radius]);
        }

        // Trier par distance dès le SQL : sinon le limit(100) retiendrait
        // 100 profils arbitraires avant que le tri PHP ne s'applique.
        if ($hasCoordinates && $filters['sort_by'] === 'distance') {
            $query->orderBy('distance');
        }

        // Get profiles first (increase to 100 for more results)
        $candidates = $query->limit(100)->get();

        // Calculate compatibility scores for all candidates
        $candidatesWithScore = $candidates->map(function ($candidate) use ($userProfile) {
            if ($userProfile && $candidate->profile) {
                $candidate->compatibility_score = $this->matchScoreService->calculateScore($userProfile, $candidate->profile);
            } else {
                $candidate->compatibility_score = 70;
            }

            return $candidate;
        });

        // Apply sorting
        switch ($filters['sort_by']) {
            case 'compatibility':
                $candidatesWithScore = $candidatesWithScore->sortByDesc('compatibility_score');
                break;
            case 'recent':
                $candidatesWithScore = $candidatesWithScore->sortByDesc('created_at');
                break;
            case 'distance':
                $candidatesWithScore = $hasCoordinates
                    ? $candidatesWithScore->sortBy('distance')
                    : $candidatesWithScore->shuffle();
                break;
            default:
                $candidatesWithScore = $candidatesWithScore->shuffle();
        }

        // Take 50 profiles for display (increased from 20)
        $candidatesWithScore = $candidatesWithScore->take(50);

        // Map to response format
        $profiles = $candidatesWithScore->map(function ($profile) {
            return [
                'id' => $profile->id,
                'name' => $profile->name,
                'pseudo' => $profile->pseudo,
                'age' => $profile->profile->age ?? null,
                'city' => $profile->profile->city ?? null,
                'distance' => isset($profile->distance) ? round($profile->distance, 1) : null,
                'bio' => $profile->profile->bio ?? null,
                'sexual_orientation' => $profile->profile->sexual_orientation ?? null,
                'primary_photo' => $profile->photos->first()?->url ?? null,
                'is_online' => $profile->last_login_at?->gt(now()->subMinutes(15)) ?? false,
                'is_premium' => $profile->isPremium(),
                'compatibility_score' => $profile->compatibility_score,
                'photo_count' => $profile->photos->count(),
            ];
        })->values();

        // Get user's likes given (to mark already liked profiles)
        $likedUserIds = $user->likesGiven()->pluck('liked_user_id')->toArray();

        return Inertia::render('dashboard', [
            'profiles' => $profiles,
            'likedUserIds' => $likedUserIds,
            'filters' => $filters,
            'liveSignals' => $this->buildLiveSignals($user),
        ]);
    }

    /**
     * Construit les signaux "live" affichés dans le hero du dashboard :
     * compteur d'utilisatrices en ligne, dernier like reçu, nombre de
     * profile views récentes, et nombre de nouveaux profils du jour.
     *
     * @return array{
     *     online_count: int,
     *     last_like: array{name: string, age: int|null, when: string|null}|null,
     *     recent_views: int,
     *     new_profiles_today: int
     * }
     */
    protected function buildLiveSignals(User $user): array
    {
        $onlineCount = User::query()
            ->where('id', '!=', $user->id)
            ->where('is_verified', true)
            ->where('is_banned', false)
            ->where('last_login_at', '>=', now()->subMinutes(15))
            ->count();

        $lastLikeRow = Like::query()
            ->where('liked_user_id', $user->id)
            ->with(['user.profile' => function ($q) {
                $q->select('user_id', 'age', 'date_of_birth');
            }])
            ->latest()
            ->first();

        $lastLike = $lastLikeRow ? [
            'name' => $lastLikeRow->user->name,
            'age' => $lastLikeRow->user->profile?->age,
            'when' => $lastLikeRow->created_at?->diffForHumans(),
        ] : null;

        $recentViews = ProfileVisit::query()
            ->where('visited_user_id', $user->id)
            ->where('created_at', '>=', now()->subHours(24))
            ->count();

        $newProfilesToday = User::query()
            ->where('id', '!=', $user->id)
            ->where('is_verified', true)
            ->where('is_banned', false)
            ->where('created_at', '>=', now()->startOfDay())
            ->count();

        return [
            'online_count' => $onlineCount,
            'last_like' => $lastLike,
            'recent_views' => $recentViews,
            'new_profiles_today' => $newProfilesToday,
        ];
    }
}
