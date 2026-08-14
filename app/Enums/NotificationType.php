<?php

namespace App\Enums;

enum NotificationType: string
{
    case NewMessage = 'new_message';
    case LikeReceived = 'like_received';
    case MatchCreated = 'match_created';
    case GalleryAccess = 'gallery_access';
    case NewMembers = 'new_members';

    /**
     * Human readable label shown in the settings screen.
     */
    public function label(): string
    {
        return match ($this) {
            self::NewMessage => 'Nouveaux messages',
            self::LikeReceived => 'Likes reçus',
            self::MatchCreated => 'Nouveaux matchs',
            self::GalleryAccess => 'Accès à ma galerie privée',
            self::NewMembers => 'Nouvelles inscrites',
        };
    }

    /**
     * Short description shown under the label.
     */
    public function description(): string
    {
        return match ($this) {
            self::NewMessage => 'Quand une personne vous écrit.',
            self::LikeReceived => 'Quand une personne vous like.',
            self::MatchCreated => 'Quand un like est réciproque.',
            self::GalleryAccess => 'Demandes et réponses d’accès à vos photos privées.',
            self::NewMembers => 'Profils récemment inscrits correspondant à vos critères.',
        };
    }

    /**
     * Frequencies a user may choose for this notification type.
     *
     * @return array<int, NotificationFrequency>
     */
    public function availableFrequencies(): array
    {
        if ($this === self::NewMembers) {
            return [NotificationFrequency::Weekly, NotificationFrequency::Never];
        }

        return [
            NotificationFrequency::Immediate,
            NotificationFrequency::Daily,
            NotificationFrequency::Weekly,
            NotificationFrequency::Never,
        ];
    }

    /**
     * Frequency applied when the user has never chosen one.
     */
    public function defaultFrequency(): NotificationFrequency
    {
        return $this === self::NewMembers
            ? NotificationFrequency::Weekly
            : NotificationFrequency::Daily;
    }
}
