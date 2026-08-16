<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $notifications = $user->appNotifications()
            ->latest()
            ->paginate(20);

        $unreadCount = $user->appNotifications()
            ->where('is_read', false)
            ->count();

        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications,
            'unreadCount' => $unreadCount,
        ]);
    }

    public function unread(Request $request): JsonResponse
    {
        $user = $request->user();

        $notifications = $user->appNotifications()
            ->where('is_read', false)
            ->latest()
            ->limit(10)
            ->get();

        $unreadCount = $user->appNotifications()
            ->where('is_read', false)
            ->count();

        return response()->json([
            'notifications' => $this->presentNotifications($notifications),
            'unreadCount' => $unreadCount,
        ]);
    }

    /**
     * Projette les notifications dans la forme attendue par la cloche du layout.
     *
     * L'émettrice n'est pas une relation : elle vit dans `data.sender_id`. Sans
     * ce champ `user` reconstruit, le composant lit `notification.user.id` sur
     * `undefined` et fait tomber tout le layout.
     *
     * @param  \Illuminate\Support\Collection<int, Notification>  $notifications
     * @return array<int, array{id: int, type: string, message: string, user: array{id: int, name: string, photo: string|null}, created_at: string}>
     */
    private function presentNotifications(\Illuminate\Support\Collection $notifications): array
    {
        $senderIds = $notifications
            ->map(fn (Notification $notification): mixed => $notification->data['sender_id'] ?? null)
            ->filter()
            ->unique();

        $senders = User::whereIn('id', $senderIds)
            ->with(['photos' => fn ($query) => $query->where('is_approved', true)->limit(1)])
            ->get()
            ->keyBy('id');

        return $notifications
            ->map(function (Notification $notification) use ($senders): ?array {
                $sender = $senders->get($notification->data['sender_id'] ?? null);

                // Une notification dont l'émettrice a supprimé son compte n'a
                // plus rien à afficher : on la retire plutôt que d'exposer un
                // profil fantôme cliquable.
                if (! $sender instanceof User) {
                    return null;
                }

                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'message' => $notification->message,
                    'user' => [
                        'id' => $sender->id,
                        'name' => $sender->name,
                        'photo' => $sender->photos->first()?->viewUrl(thumbnail: true),
                    ],
                    'created_at' => $notification->created_at->toISOString(),
                ];
            })
            ->filter()
            ->values()
            ->all();
    }

    public function markAsRead(Request $request, Notification $notification): RedirectResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->markAsRead();

        return back();
    }

    public function markAllAsRead(Request $request): RedirectResponse
    {
        $request->user()
            ->appNotifications()
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        return back()->with('success', 'Toutes les notifications ont été marquées comme lues.');
    }

    public function destroy(Request $request, Notification $notification): RedirectResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403);
        }

        $notification->delete();

        return back()->with('success', 'Notification supprimée.');
    }
}
