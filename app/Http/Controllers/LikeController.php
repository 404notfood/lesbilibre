<?php

namespace App\Http\Controllers;

use App\Events\LikeReceived;
use App\Events\MatchCreated;
use App\Models\Like;
use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LikeController extends Controller
{
    /**
     * Like a user's profile.
     */
    public function store(Request $request, int $userId): RedirectResponse
    {
        $currentUser = $request->user();

        // Check if user exists and is not self
        if ($userId === $currentUser->id) {
            return redirect()->back()->with('error', 'Vous ne pouvez pas aimer votre propre profil.');
        }

        $targetUser = User::findOrFail($userId);

        if (! $currentUser->canInteractWith($targetUser)) {
            return redirect()->back()->with('error', 'Cette interaction n’est pas disponible.');
        }

        // Check if already liked
        $existingLike = $currentUser->likesGiven()
            ->where('liked_user_id', $userId)
            ->first();

        if ($existingLike) {
            return redirect()->back()->with('info', 'Vous avez déjà aimé ce profil.');
        }

        // Create the like
        $like = Like::create([
            'user_id' => $currentUser->id,
            'liked_user_id' => $userId,
        ]);

        // Load relationships for broadcasting
        $like->load(['user.photos']);

        // Broadcast the like notification
        broadcast(new LikeReceived($like))->toOthers();

        // Check if mutual like (match)
        $mutualLike = $targetUser->likesGiven()
            ->where('liked_user_id', $currentUser->id)
            ->exists();

        if ($mutualLike) {
            // Create match
            $user1Id = min($currentUser->id, $userId);
            $user2Id = max($currentUser->id, $userId);

            $match = UserMatch::firstOrCreate([
                'user1_id' => $user1Id,
                'user2_id' => $user2Id,
            ], [
                'matched_at' => now(),
            ]);

            // Load relationships for broadcasting
            $match->load(['user1.photos', 'user2.photos']);

            // Broadcast match notification to both users
            broadcast(new MatchCreated($match, $currentUser->id));
            broadcast(new MatchCreated($match, $userId));

            return redirect()->back()->with('success', 'C\'est un match ! Vous pouvez maintenant discuter.');
        }

        return redirect()->back()->with('success', 'Profil aimé avec succès.');
    }

    /**
     * Unlike a user's profile.
     */
    public function destroy(Request $request, int $userId): RedirectResponse
    {
        $currentUser = $request->user();

        $like = $currentUser->likesGiven()
            ->where('liked_user_id', $userId)
            ->first();

        if (! $like) {
            return redirect()->back()->with('error', 'Vous n\'avez pas aimé ce profil.');
        }

        $like->delete();

        return redirect()->back()->with('success', 'Like retiré avec succès.');
    }

    /**
     * Show users who liked the current user.
     */
    public function received(Request $request): Response
    {
        $user = $request->user();

        $likes = $user->likesReceived()
            ->with(['user.profile', 'user.photos' => function ($query) {
                $query->where('is_approved', true)
                    ->where('is_primary', true);
            }])
            ->latest()
            ->paginate(20);

        return Inertia::render('Likes/Received', [
            'likes' => $likes,
            'isPremium' => $request->user()->isPremium(),
        ]);
    }
}
