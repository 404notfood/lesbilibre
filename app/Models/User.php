<?php

namespace App\Models;

use App\Enums\NotificationFrequency;
use App\Enums\NotificationType;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, SoftDeletes, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'pseudo',
        'email',
        'password',
        'last_login_at',
        'data_processing_consent',
        'data_processing_consented_at',
        'marketing_consent',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'referral_code',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'is_admin' => 'boolean',
            'is_verified' => 'boolean',
            'is_banned' => 'boolean',
            'banned_at' => 'datetime',
            'is_premium' => 'boolean',
            'premium_expires_at' => 'datetime',
            'gems' => 'integer',
            'last_login_at' => 'datetime',
            'last_activity_at' => 'datetime',
            'activity_seen_at' => 'datetime',
            'trust_score' => 'integer',
            'trust_score_updated_at' => 'datetime',
            'data_processing_consent' => 'boolean',
            'data_processing_consented_at' => 'datetime',
            'marketing_consent' => 'boolean',
        ];
    }

    /**
     * Get the user's profile.
     */
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    /**
     * Get the user's photos.
     */
    public function photos(): HasMany
    {
        return $this->hasMany(Photo::class);
    }

    /**
     * Get the user's verification photos.
     */
    public function verificationPhotos(): HasMany
    {
        return $this->hasMany(VerificationPhoto::class);
    }

    /**
     * Get the user's notification preferences.
     */
    public function notificationPreferences(): HasMany
    {
        return $this->hasMany(NotificationPreference::class);
    }

    /**
     * Get the chosen frequency for a notification type, falling back to its
     * default when the user has never set one.
     */
    public function notificationFrequency(NotificationType $type): NotificationFrequency
    {
        $preference = $this->relationLoaded('notificationPreferences')
            ? $this->notificationPreferences->firstWhere('type', $type)
            : $this->notificationPreferences()->where('type', $type->value)->first();

        return $preference?->frequency ?? $type->defaultFrequency();
    }

    /**
     * Determine whether the user wants a given notification at a given frequency.
     */
    public function wantsNotification(NotificationType $type, NotificationFrequency $frequency): bool
    {
        return $this->notificationFrequency($type) === $frequency;
    }

    /**
     * Get likes given by the user.
     */
    public function likesGiven(): HasMany
    {
        return $this->hasMany(Like::class, 'user_id');
    }

    /**
     * Get likes received by the user.
     */
    public function likesReceived(): HasMany
    {
        return $this->hasMany(Like::class, 'liked_user_id');
    }

    /**
     * Get messages sent by the user.
     */
    public function messagesSent(): HasMany
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    /**
     * Get reports made by the user.
     */
    public function reportsMade(): HasMany
    {
        return $this->hasMany(Report::class, 'reporter_id');
    }

    /**
     * Get reports against the user.
     */
    public function reportsReceived(): HasMany
    {
        return $this->hasMany(Report::class, 'reported_user_id');
    }

    /**
     * Get matches where this user is user1.
     */
    public function matchesAsUser1(): HasMany
    {
        return $this->hasMany(UserMatch::class, 'user1_id');
    }

    /**
     * Get matches where this user is user2.
     */
    public function matchesAsUser2(): HasMany
    {
        return $this->hasMany(UserMatch::class, 'user2_id');
    }

    /**
     * Get all matches for the user (query builder scope, not a relationship).
     */
    public function matches(): Builder
    {
        return UserMatch::query()
            ->where(function ($q) {
                $q->where('user1_id', $this->id)
                    ->orWhere('user2_id', $this->id);
            });
    }

    /**
     * Get users blocked by this user.
     */
    public function blockedUsers(): HasMany
    {
        return $this->hasMany(BlockedUser::class, 'blocker_id');
    }

    /**
     * Get users who blocked this user.
     */
    public function blockedBy(): HasMany
    {
        return $this->hasMany(BlockedUser::class, 'blocked_id');
    }

    /**
     * Check if this user has blocked another user.
     */
    public function hasBlocked(int $userId): bool
    {
        return $this->blockedUsers()->where('blocked_id', $userId)->exists();
    }

    /**
     * Check if this user is blocked by another user.
     */
    public function isBlockedBy(int $userId): bool
    {
        return $this->blockedBy()->where('blocker_id', $userId)->exists();
    }

    /** Whether two users may see or contact each other. */
    public function canInteractWith(User $other): bool
    {
        return $this->id !== $other->id
            && ! $this->hasBlocked($other->id)
            && ! $this->isBlockedBy($other->id)
            && ! $other->is_banned;
    }

    /**
     * Get the private gallery access requests this user received.
     */
    public function galleryAccessRequestsReceived(): HasMany
    {
        return $this->hasMany(GalleryAccessRequest::class, 'owner_user_id');
    }

    /**
     * Get the private gallery access requests this user sent.
     */
    public function galleryAccessRequestsSent(): HasMany
    {
        return $this->hasMany(GalleryAccessRequest::class, 'requester_user_id');
    }

    /**
     * Whether $viewer has been granted access to this user's private gallery.
     *
     * A revoked grant no longer counts, and the owner always sees their own.
     */
    public function grantsGalleryAccessTo(?self $viewer): bool
    {
        if ($viewer === null) {
            return false;
        }

        if ($viewer->id === $this->id) {
            return true;
        }

        return $this->galleryAccessRequestsReceived()
            ->where('requester_user_id', $viewer->id)
            ->where('status', 'accepted')
            ->whereNull('revoked_at')
            ->exists();
    }

    /**
     * Get the user's subscriptions.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Get the user's gem transactions.
     */
    public function gemTransactions(): HasMany
    {
        return $this->hasMany(GemTransaction::class);
    }

    public function referralsMade(): HasMany
    {
        return $this->hasMany(Referral::class, 'referrer_id');
    }

    public function referralReceived(): HasOne
    {
        return $this->hasOne(Referral::class, 'referred_user_id');
    }

    /**
     * Get the user's app notifications (custom, not Laravel's Notifiable).
     */
    public function appNotifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Check if user has active premium subscription.
     * A null premium_expires_at means unlimited premium.
     */
    /**
     * Fenêtre de présence : au-delà, la membre n'est plus considérée en ligne.
     *
     * Volontairement courte — un « en ligne » qui persiste un quart d'heure
     * après le départ ne veut plus rien dire.
     */
    public const ONLINE_WINDOW_MINUTES = 5;

    /**
     * Présence en ligne, basée sur l'activité réelle plutôt que sur la seule
     * connexion — `last_login_at` sert de repli pour les comptes qui n'ont pas
     * encore navigué depuis l'ajout du suivi.
     */
    public function getIsOnlineAttribute(): bool
    {
        $lastSeen = $this->last_activity_at ?? $this->last_login_at;

        return $lastSeen !== null
            && $lastSeen->gt(now()->subMinutes(self::ONLINE_WINDOW_MINUTES));
    }

    /**
     * Restreint la requête aux membres actuellement en ligne.
     */
    public function scopeOnline(Builder $query): Builder
    {
        $threshold = now()->subMinutes(self::ONLINE_WINDOW_MINUTES);

        return $query->where(function (Builder $q) use ($threshold) {
            $q->where('last_activity_at', '>=', $threshold)
                ->orWhere(function (Builder $fallback) use ($threshold) {
                    $fallback->whereNull('last_activity_at')
                        ->where('last_login_at', '>=', $threshold);
                });
        });
    }

    public function isPremium(): bool
    {
        return $this->is_premium &&
               ($this->premium_expires_at === null || $this->premium_expires_at->isFuture());
    }

    /**
     * Add gems to user balance.
     *
     * @deprecated Use GemService::addGems() instead for proper reason tracking.
     */
    public function addGems(int $amount, string $type, ?string $description = null, ?array $metadata = null): GemTransaction
    {
        return DB::transaction(function () use ($amount, $type, $description, $metadata) {
            $this->increment('gems', $amount);
            $this->refresh();

            return $this->gemTransactions()->create([
                'type' => $type,
                'amount' => $amount,
                'balance_after' => $this->gems,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        });
    }

    /**
     * Get badges earned by the user.
     */
    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
            ->withPivot('progress', 'awarded_at')
            ->withTimestamps();
    }

    /**
     * Get total badge points for the user.
     */
    public function getBadgePointsAttribute(): int
    {
        return $this->badges()
            ->whereNotNull('user_badges.awarded_at')
            ->sum('points');
    }

    /**
     * Deduct gems from user balance.
     *
     * @deprecated Use GemService::deductGems() instead for proper reason tracking.
     */
    public function deductGems(int $amount, string $type, ?string $description = null, ?array $metadata = null): ?GemTransaction
    {
        return DB::transaction(function () use ($amount, $type, $description, $metadata) {
            if ($this->gems < $amount) {
                return null;
            }

            $this->decrement('gems', $amount);
            $this->refresh();

            return $this->gemTransactions()->create([
                'type' => $type,
                'amount' => -$amount,
                'balance_after' => $this->gems,
                'description' => $description,
                'metadata' => $metadata,
            ]);
        });
    }
}
