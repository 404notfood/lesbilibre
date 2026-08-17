<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use App\Models\User;
use App\Services\ModerationAuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

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
            'gems_balance' => (int) $user->gems,
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
                'gems_balance' => (int) $user->gems,
                'badge_points' => $user->badge_points,
                'last_activity_at' => $user->last_activity_at,
                'created_at' => $user->created_at,
                'profile' => $user->profile,
                'photos' => $user->photos
                    ->sortBy('order')
                    ->values()
                    ->map(function (Photo $photo) use ($user) {
                        $disk = Storage::disk($photo->isVideo() ? 'local' : 'public');
                        $available = $disk->exists($photo->path);
                        $posterAvailable = $photo->isVideo()
                            && $photo->thumbnail_path !== null
                            && $disk->exists($photo->thumbnail_path);

                        return [
                            'id' => $photo->id,
                            'url' => $available
                                ? route('admin.users.photos.file', [$user, $photo])
                                : null,
                            'poster_url' => $posterAvailable
                                ? route('admin.users.photos.file', [$user, $photo, 'thumb' => 1])
                                : null,
                            'media_type' => $photo->isVideo() ? 'video' : 'photo',
                            'available' => $available,
                            'is_primary' => $photo->is_primary,
                            'is_naughty' => $photo->is_naughty,
                            'moderation_status' => $photo->moderation_status,
                            'rejection_reason' => $photo->rejection_reason,
                            'avatar_requested' => $photo->avatar_requested_at !== null,
                            'created_at' => $photo->created_at->toISOString(),
                        ];
                    }),
                'badges' => $user->badges,
                'subscriptions' => $user->subscriptions,
            ],
            'stats' => $stats,
        ]);
    }

    /** Stream an original gallery file to an authenticated administrator. */
    public function photoFile(Request $request, User $user, Photo $photo): StreamedResponse
    {
        abort_unless($photo->user_id === $user->id, 404);

        $disk = Storage::disk($photo->isVideo() ? 'local' : 'public');
        $useThumbnail = $request->boolean('thumb') && $photo->thumbnail_path !== null;
        $path = $useThumbnail ? $photo->thumbnail_path : $photo->path;

        abort_unless($disk->exists($path), 404);

        $isVideo = $photo->isVideo() && ! $useThumbnail;
        $headers = [
            'Content-Type' => $isVideo ? 'video/mp4' : ($disk->mimeType($path) ?: 'image/jpeg'),
            'Cache-Control' => 'private, no-store, max-age=0',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Disposition' => 'inline',
        ];

        if ($isVideo) {
            $headers['Accept-Ranges'] = 'bytes';
        }

        return $disk->response($path, null, $headers);
    }

    /**
     * Flag or unflag one of the member's photos as sensitive.
     *
     * Members classify their own uploads, but they get it wrong — this is the
     * lever that puts a nude behind the blur without deleting it.
     */
    public function togglePhotoSensitivity(Request $request, User $user, Photo $photo): RedirectResponse
    {
        abort_unless($photo->user_id === $user->id, 404);

        $sensitive = ! $photo->is_naughty;

        $photo->update([
            'is_naughty' => $sensitive,
            // Une photo sensible ne peut pas rester l'avatar du profil.
            'is_primary' => $sensitive ? false : $photo->is_primary,
            'avatar_requested_at' => $sensitive ? null : $photo->avatar_requested_at,
        ]);

        app(ModerationAuditService::class)->record(
            $request->user(),
            $photo,
            $sensitive ? 'photo_marked_sensitive' : 'photo_unmarked_sensitive',
            $user
        );

        return redirect()->back()->with(
            'success',
            $sensitive
                ? 'Photo marquée comme sensible : elle est désormais floutée.'
                : 'Photo marquée comme tout public.'
        );
    }

    /**
     * Strip the member's avatar without touching the rest of the gallery.
     */
    public function clearAvatar(Request $request, User $user): RedirectResponse
    {
        $user->photos()->update(['is_primary' => false]);

        app(ModerationAuditService::class)->record(
            $request->user(), $user, 'avatar_cleared', $user
        );

        return redirect()->back()->with('success', 'Photo de profil retirée.');
    }

    /**
     * Delete one of the member's photos.
     */
    public function destroyPhoto(Request $request, User $user, Photo $photo): RedirectResponse
    {
        abort_unless($photo->user_id === $user->id, 404);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        Storage::disk('public')->delete($photo->path);
        if ($photo->thumbnail_path) {
            Storage::disk('public')->delete($photo->thumbnail_path);
        }

        app(ModerationAuditService::class)->record(
            $request->user(),
            $photo,
            'photo_deleted_by_admin',
            $user,
            'photo_deleted',
            $validated['reason']
        );

        $photo->delete();

        return redirect()->back()->with('success', 'Photo supprimée.');
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

            return redirect()->back()->with('success', 'Le statut premium a été retiré.');
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
