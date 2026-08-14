<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Like extends Model
{
    /** @use HasFactory<\Database\Factories\LikeFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'liked_user_id',
    ];

    /**
     * Get the user who gave the like.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who gave the like (alias).
     */
    public function liker(): BelongsTo
    {
        return $this->user();
    }

    /**
     * Get the user who received the like.
     */
    public function likedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'liked_user_id');
    }
}
