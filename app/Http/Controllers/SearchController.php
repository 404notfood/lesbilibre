<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    /**
     * Display search page with results.
     */
    public function index(Request $request): Response
    {
        $filters = $request->validate([
            'min_age' => ['nullable', 'integer', 'min:18', 'max:99'],
            'max_age' => ['nullable', 'integer', 'min:18', 'max:99'],
            'city' => ['nullable', 'string', 'max:255'],
            'distance' => ['nullable', 'integer', 'min:1', 'max:500'],
            'sexual_orientation' => ['nullable', 'array'],
            'sexual_orientation.*' => ['string'],
            'relationship_status' => ['nullable', 'array'],
            'relationship_status.*' => ['string'],
            'looking_for' => ['nullable', 'array'],
            'looking_for.*' => ['string'],
            'body_type' => ['nullable', 'array'],
            'body_type.*' => ['string'],
            'hair_color' => ['nullable', 'array'],
            'hair_color.*' => ['string'],
            'eye_color' => ['nullable', 'array'],
            'eye_color.*' => ['string'],
            'ethnicity' => ['nullable', 'array'],
            'ethnicity.*' => ['string'],
            'education' => ['nullable', 'array'],
            'education.*' => ['string'],
            'smoking' => ['nullable', 'array'],
            'smoking.*' => ['string'],
            'drinking' => ['nullable', 'array'],
            'drinking.*' => ['string'],
            'children' => ['nullable', 'array'],
            'children.*' => ['string'],
            'wants_children' => ['nullable', 'array'],
            'wants_children.*' => ['string'],
            'min_height' => ['nullable', 'integer', 'min:100', 'max:250'],
            'max_height' => ['nullable', 'integer', 'min:100', 'max:250'],
            'has_photo' => ['nullable', 'boolean'],
            'is_verified' => ['nullable', 'boolean'],
            'interests' => ['nullable', 'array'],
            'interests.*' => ['string'],
            'sort_by' => ['nullable', 'in:distance,newest,activity,popular'],
        ]);

        $query = $this->buildSearchQuery($request->user(), $filters);

        // Apply sorting
        $query = $this->applySorting($query, $filters['sort_by'] ?? 'distance', $request->user());

        $results = $query->paginate(20)->withQueryString();

        return Inertia::render('Search/Index', [
            'filters' => $filters,
            'results' => $results,
            'profileOptions' => config('profile-options'),
        ]);
    }

    /**
     * Build the search query based on filters.
     */
    protected function buildSearchQuery(User $currentUser, array $filters)
    {
        $query = User::with(['profile', 'photos' => function ($query) {
            $query->where('is_approved', true)->where('is_primary', true);
        }])
            ->where('users.id', '!=', $currentUser->id)
            ->where('users.is_verified', true)
            ->where('users.is_banned', false)
            ->whereHas('profile', fn ($profile) => $profile->where('is_discoverable', true));

        // Jointure unique sur profiles : elle porte à la fois le filtre de
        // rayon et la colonne `distance` exposée aux résultats.
        if ($this->hasCoordinates($currentUser)) {
            $lat = (float) $currentUser->profile->latitude;
            $lon = (float) $currentUser->profile->longitude;

            $query->join('profiles', 'users.id', '=', 'profiles.user_id')
                ->select('users.*')
                ->selectRaw($this->haversineExpression().' as distance', [$lat, $lon, $lat]);
        }

        // Age filter
        // Comparaison sur la date complète : YEAR() seul décalait les bornes
        // d'un an pour les anniversaires non encore passés dans l'année.
        if (! empty($filters['min_age']) || ! empty($filters['max_age'])) {
            $query->whereHas('profile', function ($q) use ($filters) {
                if (! empty($filters['min_age'])) {
                    $q->whereDate('date_of_birth', '<=', now()->subYears((int) $filters['min_age'])->toDateString());
                }
                if (! empty($filters['max_age'])) {
                    $q->whereDate('date_of_birth', '>=', now()->subYears((int) $filters['max_age'] + 1)->toDateString());
                }
            });
        }

        // City filter
        if (! empty($filters['city'])) {
            $query->whereHas('profile', function ($q) use ($filters) {
                $q->where('city', 'like', '%'.$filters['city'].'%');
            });
        }

        // Distance filter
        if (! empty($filters['distance']) && $this->hasCoordinates($currentUser)) {
            $lat = (float) $currentUser->profile->latitude;
            $lon = (float) $currentUser->profile->longitude;

            $query->whereNotNull('profiles.latitude')
                ->whereNotNull('profiles.longitude')
                ->whereRaw(
                    $this->haversineExpression().' <= ?',
                    [$lat, $lon, $lat, (int) $filters['distance']]
                );
        }

        // Profile attribute filters (all support multiple values)
        $profileFilters = [
            'sexual_orientation',
            'relationship_status',
            'looking_for',
            'body_type',
            'hair_color',
            'eye_color',
            'ethnicity',
            'education',
            'smoking',
            'drinking',
            'children',
            'wants_children',
        ];

        foreach ($profileFilters as $filterKey) {
            if (! empty($filters[$filterKey])) {
                $query->whereHas('profile', function ($q) use ($filterKey, $filters) {
                    $q->whereIn($filterKey, $filters[$filterKey]);
                });
            }
        }

        // Height filter
        if (! empty($filters['min_height']) || ! empty($filters['max_height'])) {
            $query->whereHas('profile', function ($q) use ($filters) {
                if (! empty($filters['min_height'])) {
                    $q->where('height', '>=', $filters['min_height']);
                }
                if (! empty($filters['max_height'])) {
                    $q->where('height', '<=', $filters['max_height']);
                }
            });
        }

        // Has photo filter
        if (! empty($filters['has_photo'])) {
            $query->whereHas('photos', function ($q) {
                $q->where('is_approved', true);
            });
        }

        // Is verified filter
        if (isset($filters['is_verified']) && $filters['is_verified']) {
            $query->where('is_verified', true);
        }

        // Interests filter
        if (! empty($filters['interests'])) {
            $query->whereHas('profile', function ($q) use ($filters) {
                foreach ($filters['interests'] as $interest) {
                    $q->whereJsonContains('interests', $interest);
                }
            });
        }

        // Exclude blocked users
        $query->whereNotIn('users.id', function ($subquery) use ($currentUser) {
            $subquery->select('blocked_id')
                ->from('blocked_users')
                ->where('blocker_id', $currentUser->id);
        })
            ->whereNotIn('users.id', function ($subquery) use ($currentUser) {
                $subquery->select('blocker_id')
                    ->from('blocked_users')
                    ->where('blocked_id', $currentUser->id);
            });

        return $query;
    }

    /**
     * Apply sorting to the search query.
     */
    protected function applySorting($query, string $sortBy, User $currentUser)
    {
        switch ($sortBy) {
            case 'newest':
                return $query->latest('users.created_at');

            case 'activity':
                return $query->latest('users.last_activity_at');

            case 'popular':
                return $query->withCount('likesReceived')
                    ->orderBy('likes_received_count', 'desc');

            case 'distance':
            default:
                if ($this->hasCoordinates($currentUser)) {
                    return $query->orderBy('distance');
                }

                return $query->latest('users.created_at');
        }
    }

    /**
     * Formule de Haversine appliquée à la table `profiles`.
     *
     * `least`/`greatest` bornent l'argument d'acos : sans cette protection,
     * les arrondis flottants produisent NaN pour deux profils d'une même ville.
     */
    protected function haversineExpression(): string
    {
        return '(6371 * acos(least(1, greatest(-1, '
            .'cos(radians(?)) * cos(radians(profiles.latitude)) '
            .'* cos(radians(profiles.longitude) - radians(?)) '
            .'+ sin(radians(?)) * sin(radians(profiles.latitude))'
            .'))))';
    }

    protected function hasCoordinates(User $user): bool
    {
        return $user->profile !== null
            && $user->profile->latitude !== null
            && $user->profile->longitude !== null;
    }
}
