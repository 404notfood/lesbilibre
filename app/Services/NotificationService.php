<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Referral;
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
     * Create a gallery access request notification for the gallery owner.
     */
    public function notifyGalleryAccessRequest(int $userId, int $requesterId): void
    {
        Notification::create([
            'user_id' => $userId,
            'type' => 'gallery_access',
            'title' => 'Demande d\'accès à votre galerie',
            'message' => 'souhaite accéder à votre galerie privée',
            'data' => [
                'requester_id' => $requesterId,
                'status' => 'pending',
            ],
        ]);
    }

    /**
     * Create a gallery access accepted notification for the requester.
     */
    public function notifyGalleryAccessAccepted(int $userId, int $ownerId): void
    {
        Notification::create([
            'user_id' => $userId,
            'type' => 'gallery_access',
            'title' => 'Accès galerie accordé',
            'message' => 'vous a donné accès à sa galerie privée',
            'data' => [
                'owner_id' => $ownerId,
                'status' => 'accepted',
            ],
        ]);
    }

    /**
     * Create a gallery access rejected notification for the requester.
     */
    public function notifyGalleryAccessRejected(int $userId, int $ownerId): void
    {
        Notification::create([
            'user_id' => $userId,
            'type' => 'gallery_access',
            'title' => 'Demande d\'accès refusée',
            'message' => 'a refusé votre demande d\'accès. Vos gemmes ont été remboursées.',
            'data' => [
                'owner_id' => $ownerId,
                'status' => 'rejected',
            ],
        ]);
    }

    public function notifyReferralReward(
        User $referrer,
        User $referredUser,
        int $reward,
        Referral $referral,
    ): void {
        Notification::create([
            'user_id' => $referrer->id,
            'type' => 'referral_reward',
            'title' => 'Parrainage validé',
            'message' => "{$referredUser->pseudo} a été vérifiée : vous gagnez {$reward} gemmes.",
            'data' => [
                'referral_id' => $referral->id,
                'referred_user_id' => $referredUser->id,
                'reward' => $reward,
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
