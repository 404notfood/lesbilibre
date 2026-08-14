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
        'is_approved',
        'is_naughty',
        'order',
        'rejection_reason',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'is_approved' => 'boolean',
            'is_naughty' => 'boolean',
            'order' => 'integer',
        ];
    }

    /**
     * Get the user that owns the photo.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
