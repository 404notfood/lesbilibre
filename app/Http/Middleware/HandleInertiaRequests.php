<?php

namespace App\Http\Middleware;

use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Models\GalleryAccessRequest;
use App\Models\Like;
use App\Models\Photo;
use App\Models\ProfileVisit;
use App\Models\Report;
use App\Models\UserMatch;
use App\Models\VerificationPhoto;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        $unreadConversationsCount = 0;
        $recentActivitiesCount = 0;
        $pendingGalleryRequestsCount = 0;

        if ($user) {
            $user->loadMissing('profile');
            // Nombre de conversations avec messages non lus
            $unreadConversationsCount = Conversation::where(function ($query) use ($user) {
                $query->where('user1_id', $user->id)->orWhere('user2_id', $user->id);
            })
                ->whereHas('messages', function ($query) use ($user) {
                    $query->where('sender_id', '!=', $user->id)
                        ->where('read_at', null);
                })
                ->count();

            // Nombre d'activités récentes (non lues)
            $recentActivitiesCount = Like::where('liked_user_id', $user->id)
                ->where('created_at', '>=', now()->subDays(7))
                ->count()
                + ProfileVisit::where('visited_user_id', $user->id)
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count()
                + UserMatch::where(function ($query) use ($user) {
                    $query->where('user1_id', $user->id)->orWhere('user2_id', $user->id);
                })
                    ->where('created_at', '>=', now()->subDays(7))
                    ->count();

            // Demandes d'accès à la galerie privée en attente de réponse
            $pendingGalleryRequestsCount = GalleryAccessRequest::where('owner_user_id', $user->id)
                ->where('status', 'pending')
                ->count();
        }

        // Alertes admin — partagées uniquement si l'utilisateur est admin
        // pour pouvoir afficher les badges (modération, signalements, etc.)
        // dans la sidebar de l'AdminLayout.
        $adminAlerts = null;
        if ($user && ($user->is_admin ?? false)) {
            $adminAlerts = [
                'pending_photos' => Photo::where('is_approved', false)->count(),
                'pending_verifications' => VerificationPhoto::where('status', 'pending')->count(),
                'open_reports' => Report::where('status', 'pending')->count(),
                'flagged_ephemeral' => EphemeralMedia::where('is_flagged', true)
                    ->whereNull('purged_at')
                    ->count(),
            ];
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $request->user(),
                // La colonne `is_premium` seule ne dit pas si l'abonnement court
                // encore : on partage l'état calculé, expiration comprise.
                'isPremium' => (bool) $user?->isPremium(),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'counts' => [
                'unreadConversations' => $unreadConversationsCount,
                'recentActivities' => $recentActivitiesCount,
                'pendingGalleryRequests' => $pendingGalleryRequestsCount,
            ],
            'onboarding' => $user ? [
                'profile' => (bool) ($user->profile?->bio && $user->profile?->looking_for),
                'photo' => $user->photos()->where('is_approved', true)->exists(),
                'verification' => (bool) $user->is_verified,
                'completed' => collect([
                    (bool) ($user->profile?->bio && $user->profile?->looking_for),
                    $user->photos()->where('is_approved', true)->exists(),
                    (bool) $user->is_verified,
                ])->filter()->count(),
                'total' => 3,
            ] : null,
            'adminAlerts' => $adminAlerts,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
                'info' => $request->session()->get('info'),
            ],
        ];
    }
}
