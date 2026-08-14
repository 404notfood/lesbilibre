<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Photo extends Model
{
    /** @use HasFactory<\Database\Factories\PhotoFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'path',
        'content_hash',
        'moderation_status',
        'thumbnail_path',
        'is_primary',
        'avatar_requested_at',
        'is_approved',
        'is_naughty',
        'order',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'avatar_requested_at' => 'datetime',
            'is_approved' => 'boolean',
            'is_naughty' => 'boolean',
            'order' => 'integer',
        ];
    }

    /**
     * Whether this photo may be shown to a member with the given consent.
     */
    public function isVisibleTo(bool $viewerAcceptsNaughty): bool
    {
        return $this->is_approved
            && $this->moderation_status !== 'rejected'
            && ($viewerAcceptsNaughty || ! $this->is_naughty);
    }

    /**
     * URL that renders this photo for the current viewer (consent + watermark).
     * Never expose the raw storage path to members.
     */
    public function viewUrl(bool $thumbnail = false): string
    {
        return route('media.photo', $thumbnail ? [$this, 'thumb' => 1] : [$this]);
    }

    /**
     * Get the user that owns the photo.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
