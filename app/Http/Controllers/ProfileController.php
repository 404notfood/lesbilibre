<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Models\ProfileView;
use App\Services\MatchScoreService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile.
     */
    public function show(Request $request): Response
    {
        $user = $request->user()->load('profile', 'photos');

        return Inertia::render('Profile/Show', [
            'user' => $user,
            'profile' => $user->profile,
            'photos' => $user->photos()
                ->where('is_approved', true)
                ->orderBy('order')
                ->get()
                ->map(fn (\App\Models\Photo $photo) => [
                    'id' => $photo->id,
                    'url' => $photo->viewUrl(),
                    'is_primary' => $photo->is_primary,
                    'is_naughty' => $photo->is_naughty,
                ]),
        ]);
    }

    /**
     * Show the form for editing the profile.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->load('profile.naughtyInterests');

        $naughtyInterests = \App\Models\NaughtyInterest::orderBy('category')
            ->orderBy('name')
            ->get();

        $selectedNaughtyInterests = $user->profile?->naughtyInterests->pluck('id')->toArray() ?? [];

        return Inertia::render('Profile/Edit', [
            'user' => $user,
            'profile' => $user->profile,
            'naughtyInterests' => $naughtyInterests,
            'selectedNaughtyInterests' => $selectedNaughtyInterests,
            'profileOptions' => config('profile-options'),
        ]);
    }

    /**
     * Update the user's profile.
     */
    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $user = $request->user();
        $profile = $user->profile;

        $validated = $request->validated();
        $naughtyInterestIds = $validated['naughty_interest_ids'] ?? [];
        unset($validated['naughty_interest_ids']);

        $profile->update($validated);

        // Sync naughty interests
        if ($profile->is_naughty_mode) {
            $profile->naughtyInterests()->sync($naughtyInterestIds);
        } else {
            $profile->naughtyInterests()->detach();
        }

        // Trigger badge check
        \App\Events\ProfileUpdated::dispatch($user);

        return redirect()->route('profile.edit')->with('success', 'Profil mis à jour avec succès.');
    }

    /**
     * View another user's profile.
     */
    public function view(Request $request, int $userId): Response
    {
        // Le contenu sensible dépend du consentement de CELLE QUI REGARDE,
        // pas de celle qui a publié la photo.
        $viewerAcceptsNaughty = (bool) $request->user()->profile?->is_naughty_mode;

        // Les photos sensibles restent dans la liste : la route média les sert
        // floutées si la visiteuse n'a pas consenti, plutôt que de les masquer.
        $user = \App\Models\User::with(['profile', 'photos' => function ($query) {
            $query->where('is_approved', true)
                ->where('moderation_status', '!=', 'rejected')
                ->orderBy('order');
        }])->findOrFail($userId);

        abort_unless($request->user()->canInteractWith($user), 404);

        ProfileView::firstOrCreate([
            'viewer_id' => $request->user()->id,
            'profile_user_id' => $user->id,
            'viewed_on' => today(),
        ]);

        // Check if current user has liked this profile
        $hasLiked = $request->user()
            ->likesGiven()
            ->where('liked_user_id', $userId)
            ->exists();

        // Check if there's a mutual match
        $hasMatched = \App\Models\UserMatch::where(function ($query) use ($request, $userId) {
            $query->where('user1_id', $request->user()->id)
                ->where('user2_id', $userId);
        })->orWhere(function ($query) use ($request, $userId) {
            $query->where('user1_id', $userId)
                ->where('user2_id', $request->user()->id);
        })->exists();

        // Check if user is blocked
        $hasBlocked = $request->user()->hasBlocked($userId);

        // Ensure interests and languages are properly cast to arrays
        $profile = $user->profile;
        if ($profile) {
            $profile->interests = $profile->interests ?? [];
            $profile->languages = $profile->languages ?? [];
        }

        // Calculate real compatibility score
        $matchScore = 0;
        $currentUserProfile = $request->user()->profile;
        if ($currentUserProfile && $profile) {
            $matchScore = app(MatchScoreService::class)->calculateScore($currentUserProfile, $profile);
        }

        return Inertia::render('Profile/View', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'pseudo' => $user->pseudo,
                'is_verified' => $user->is_verified,
                'is_premium' => $user->is_premium,
                'profile' => $profile,
            ],
            'photos' => $user->photos->map(fn (\App\Models\Photo $photo) => [
                'id' => $photo->id,
                'url' => $photo->viewUrl(),
                'is_primary' => $photo->is_primary,
                'is_naughty' => $photo->is_naughty,
                'is_blurred' => $photo->is_naughty && ! $viewerAcceptsNaughty,
            ]),
            'viewerAcceptsNaughty' => $viewerAcceptsNaughty,
            'hasLiked' => $hasLiked,
            'hasMatched' => $hasMatched,
            'hasBlocked' => $hasBlocked,
            'matchScore' => $matchScore,
            'profileOptions' => config('profile-options'),
        ]);
    }
}
