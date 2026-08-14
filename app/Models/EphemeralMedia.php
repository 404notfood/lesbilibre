<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EphemeralMedia extends Model
{
    /** @use HasFactory<\Database\Factories\EphemeralMediaFactory> */
    use HasFactory;

    protected $table = 'ephemeral_media';

    /** Fenêtre de revoyure, une fois le contenu ouvert. */
    public const REPLAY_WINDOW_HOURS = 24;

    /** Rétention du fichier après envoi, pour le traitement des signalements. */
    public const RETENTION_DAYS = 30;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'recipient_id',
        'type',
        'path',
        'thumbnail_path',
        'is_naughty',
        'processing_status',
        'first_viewed_at',
        'replay_available_until',
        'replayed_at',
        'purge_after',
        'purged_at',
        'is_flagged',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_naughty' => 'boolean',
            'is_flagged' => 'boolean',
            'first_viewed_at' => 'datetime',
            'replay_available_until' => 'datetime',
            'replayed_at' => 'datetime',
            'purge_after' => 'datetime',
            'purged_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recipient_id');
    }

    /**
     * Media whose file still exists on disk.
     *
     * @param  Builder<EphemeralMedia>  $query
     * @return Builder<EphemeralMedia>
     */
    public function scopeStored(Builder $query): Builder
    {
        return $query->whereNull('purged_at');
    }

    /**
     * Never opened: stays available indefinitely, so a recipient who logs in
     * a fortnight later still gets to see what was sent to them.
     */
    public function isUnopened(): bool
    {
        return $this->first_viewed_at === null;
    }

    /**
     * Whether the recipient may open this right now.
     *
     * First view is always allowed. After that, a single replay is possible
     * inside the replay window — and only if it has not been used.
     */
    public function canBeOpenedBy(User $user): bool
    {
        if ($user->id !== $this->recipient_id) {
            return false;
        }

        if ($this->purged_at !== null || $this->processing_status !== 'ready') {
            return false;
        }

        if ($this->isUnopened()) {
            return true;
        }

        return $this->replayedAtIsUnused() && $this->replayWindowIsOpen();
    }

    /**
     * Whether opening now would consume the paid replay rather than the free
     * first view.
     */
    public function wouldBeReplay(): bool
    {
        return ! $this->isUnopened();
    }

    public function replayedAtIsUnused(): bool
    {
        return $this->replayed_at === null;
    }

    public function replayWindowIsOpen(): bool
    {
        return $this->replay_available_until !== null
            && $this->replay_available_until->isFuture();
    }

    /**
     * Record the first view and open the replay window.
     */
    public function markFirstView(): void
    {
        $this->update([
            'first_viewed_at' => now(),
            'replay_available_until' => now()->addHours(self::REPLAY_WINDOW_HOURS),
        ]);
    }

    public function markReplayed(): void
    {
        $this->update(['replayed_at' => now()]);
    }
}
