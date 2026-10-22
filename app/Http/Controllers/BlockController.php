<?php

namespace App\Http\Controllers;

use App\Models\BlockedUser;
use App\Models\Like;
use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BlockController extends Controller
{
    /**
     * Display the list of blocked users.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $blockedUsers = BlockedUser::with('blocked')
            ->whereHas('blocked')
            ->where('blocker_id', $user->id)
            ->latest()
            ->get()
            ->map(function ($block) {
                return [
                    'id' => $block->id,
                    'blocked_at' => $block->created_at->toISOString(),
                    'reason' => $block->reason,
                    'user' => [
                        'id' => $block->blocked->id,
                        'pseudo' => $block->blocked->pseudo,
                        'age' => null,
                        'city' => null,
                        'photo' => null,
                    ],
                ];
            });

        return Inertia::render('settings/BlockedUsers', [
            'blockedUsers' => $blockedUsers,
        ]);
    }

    /**
     * Block a user.
     */
    public function store(Request $request, int $userId): RedirectResponse
    {
        $currentUser = $request->user();
        $request->validate(['reason' => ['nullable', 'string', 'max:255']]);

        // Vérifier que l'utilisateur ne se bloque pas lui-même
        if ($currentUser->id === $userId) {
            return back()->with('error', 'Vous ne pouvez pas vous bloquer vous-même.');
        }

        // Vérifier que l'utilisateur à bloquer existe
        User::findOrFail($userId);

        // Créer le blocage (ou ne rien faire si déjà bloqué grâce à unique constraint)
        try {
            DB::transaction(function () use ($currentUser, $userId, $request) {
                BlockedUser::firstOrCreate([
                    'blocker_id' => $currentUser->id,
                    'blocked_id' => $userId,
                ], [
                    'reason' => $request->input('reason'),
                ]);

                // Supprimer les likes mutuels
                Like::where(function ($query) use ($currentUser, $userId) {
                    $query->where('user_id', $currentUser->id)->where('liked_user_id', $userId);
                })->orWhere(function ($query) use ($currentUser, $userId) {
                    $query->where('user_id', $userId)->where('liked_user_id', $currentUser->id);
                })->delete();

                // Supprimer le match si il existe
                UserMatch::where(function ($query) use ($currentUser, $userId) {
                    $query->where('user1_id', $currentUser->id)->where('user2_id', $userId);
                })->orWhere(function ($query) use ($currentUser, $userId) {
                    $query->where('user1_id', $userId)->where('user2_id', $currentUser->id);
                })->delete();

                // The interaction checks hide the conversation in both directions.
                // Keep its rows/files so reporting evidence and retention survive.
            });

            return back()->with('success', 'Utilisateur bloqué avec succès.');
        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'Duplicate entry')) {
                return back()->with('info', 'Utilisateur déjà bloqué.');
            }

            return back()->with('error', 'Une erreur est survenue.');
        }
    }

    /**
     * Unblock a user.
     */
    public function destroy(int $blockId): RedirectResponse
    {
        $block = BlockedUser::findOrFail($blockId);

        // Vérifier que c'est bien l'utilisateur connecté qui a bloqué
        if ($block->blocker_id !== auth()->id()) {
            abort(403);
        }

        $block->delete();

        return back()->with('success', 'Utilisateur débloqué avec succès.');
    }
}
