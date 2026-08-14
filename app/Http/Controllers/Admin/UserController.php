<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ModerationAuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $query = User::with('profile');

        // Search filter
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('pseudo', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            match ($status) {
                'premium' => $query->where('is_premium', true),
                'verified' => $query->where('is_verified', true),
                'banned' => $query->where('is_banned', true),
                'active' => $query->where('last_activity_at', '>=', now()->subDays(7)),
                default => null,
            };
        }

        // Sort (whitelist to prevent SQL injection)
        $allowedSortColumns = ['created_at', 'name', 'email', 'pseudo', 'last_activity_at'];
        $sortBy = in_array($request->input('sort_by'), $allowedSortColumns) ? $request->input('sort_by') : 'created_at';
        $sortDirection = $request->input('sort_direction') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDirection);

        $users = $query->paginate(20)->withQueryString();

        // Transform users data
        $users->getCollection()->transform(fn ($user) => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'pseudo' => $user->pseudo,
            'is_premium' => $user->is_premium,
            'is_verified' => $user->is_verified,
            'is_banned' => $user->is_banned,
            'ban_reason' => $user->ban_reason,
            'gems_balance' => $user->gems_balance,
            'badge_points' => $user->badge_points,
            'last_activity_at' => $user->last_activity_at?->diffForHumans(),
            'created_at' => $user->created_at->format('Y-m-d H:i'),
            'city' => $user->profile->city ?? null,
            'age' => $user->profile->age ?? null,
        ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(Request $request, User $user): Response
    {
        $user->load([
            'profile',
            'photos',
            'badges',
            'subscriptions',
        ]);

        // User statistics
        $stats = [
            'likes_given' => $user->likesGiven()->count(),
            'likes_received' => $user->likesReceived()->count(),
            'matches' => $user->matches()->count(),
            'messages_sent' => $user->messagesSent()->count(),
            'photos_count' => $user->photos()->count(),
            'badges_count' => $user->badges()->whereNotNull('user_badges.awarded_at')->count(),
            'reports_received' => $user->reportsReceived()->count(),
            'reports_made' => $user->reportsMade()->count(),
        ];

        return Inertia::render('Admin/Users/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'pseudo' => $user->pseudo,
                'is_premium' => $user->is_premium,
                'premium_expires_at' => $user->premium_expires_at,
                'is_verified' => $user->is_verified,
                'is_banned' => $user->is_banned,
                'ban_reason' => $user->ban_reason,
                'banned_at' => $user->banned_at,
                'gems_balance' => $user->gems_balance,
                'badge_points' => $user->badge_points,
                'last_activity_at' => $user->last_activity_at,
                'created_at' => $user->created_at,
                'profile' => $user->profile,
                'photos' => $user->photos,
                'badges' => $user->badges,
                'subscriptions' => $user->subscriptions,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Ban a user.
     */
    public function ban(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $user->is_banned = true;
        $user->ban_reason = $validated['reason'];
        $user->banned_at = now();
        $user->save();

        app(ModerationAuditService::class)->record(
            $request->user(), $user, 'user_banned', $user, 'ban', $validated['reason']
        );

        return redirect()->back()->with('success', "L'utilisateur a été banni.");
    }

    /**
     * Unban a user.
     */
    public function unban(Request $request, User $user): RedirectResponse
    {
        $user->is_banned = false;
        $user->ban_reason = null;
        $user->banned_at = null;
        $user->save();

        app(ModerationAuditService::class)->record(
            $request->user(), $user, 'user_unbanned', $user
        );

        return redirect()->back()->with('success', "L'utilisateur a été débanni.");
    }

    /**
     * Toggle premium status for a user.
     */
    public function togglePremium(Request $request, User $user): RedirectResponse
    {
        if ($user->is_premium) {
            $user->is_premium = false;
            $user->premium_expires_at = null;
            $user->save();

            return redirect()->back()->with('success', "Le statut premium a été retiré.");
        }

        $validated = $request->validate([
            'premium_expires_at' => ['nullable', 'date', 'after:today'],
        ]);

        $user->is_premium = true;
        $user->premium_expires_at = $validated['premium_expires_at'] ?? null;
        $user->save();

        return redirect()->back()->with('success', "L'utilisateur est maintenant premium.");
    }

    /**
     * Delete a user.
     */
    public function destroy(Request $request, User $user): RedirectResponse
    {
        // Delete user's photos from storage
        foreach ($user->photos as $photo) {
            \Storage::disk('public')->delete($photo->path);
            if ($photo->thumbnail_path) {
                \Storage::disk('public')->delete($photo->thumbnail_path);
            }
        }

        // Delete user account
        $user->delete();

        return redirect()->route('admin.users.index')->with('success', "L'utilisateur a été supprimé.");
    }
}
