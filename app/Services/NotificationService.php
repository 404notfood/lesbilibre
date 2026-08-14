<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Create a like notification.
     */
    public function notifyLike(int $userId, int $likerId): void
    {
        Notification::create([
            'user_id' => $userId,
            'type' => 'like',
            'title' => 'Nouveau like',
            'message' => 'a aimé votre profil',
            'data' => [
                'liker_id' => $likerId,
            ],
        ]);
    }

    /**
     * Create a match notification.
     */
    public function notifyMatch(int $userId1, int $userId2): void
    {
        // Notify both users
        Notification::create([
            'user_id' => $userId1,
            'type' => 'match',
            'title' => 'Nouveau match',
            'message' => 'Vous avez un nouveau match !',
            'data' => [
                'match_id' => $userId2,
            ],
        ]);

        Notification::create([
            'user_id' => $userId2,
            'type' => 'match',
            'title' => 'Nouveau match',
            'message' => 'Vous avez un nouveau match !',
            'data' => [
                'match_id' => $userId1,
            ],
        ]);
    }

    /**
     * Create a message notification.
     */
    public function notifyMessage(int $userId, int $senderId, string $preview): void
    {
        Notification::create([
            'user_id' => $userId,
            'type' => 'message',
            'title' => 'Nouveau message',
            'message' => 'vous a envoyé un message',
            'data' => [
                'sender_id' => $senderId,
                'preview' => $preview,
            ],
        ]);
    }

    /**
     * Create a profile view notification.
     */
    public function notifyProfileView(int $userId, int $viewerId): void
    {
        // Only notify if the user has premium (feature)
        $user = User::find($userId);

        if ($user && $user->isPremium()) {
            Notification::create([
                'user_id' => $userId,
                'type' => 'view',
                'title' => 'Visite de profil',
                'message' => 'a visité votre profil',
                'data' => [
                    'viewer_id' => $viewerId,
                ],
            ]);
        }
    }

    /**
     * Create a gift notification.
     */
    public function notifyGift(int $userId, int $senderId, string $giftName): void
    {
        Notification::create([
            'user_id' => $userId,
            'type' => 'gift',
            'title' => 'Nouveau cadeau',
            'message' => "vous a envoyé un cadeau : {$giftName}",
            'data' => [
                'sender_id' => $senderId,
                'gift_name' => $giftName,
            ],
        ]);
    }

    /**
     * Mark all notifications as read for a user.
     */
    public function markAllAsRead(int $userId): void
    {
        Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * Get unread count for a user.
     */
    public function getUnreadCount(int $userId): int
    {
        return Notification::where('user_id', $userId)
            ->whereNull('read_at')
            ->count();
    }
}
