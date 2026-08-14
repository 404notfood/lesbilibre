<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProfileVisit extends Model
{
    protected $fillable = [
        'visitor_id',
        'visited_user_id',
    ];

    /**
     * Get the user who visited the profile.
     */
    public function visitor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'visitor_id');
    }

    /**
     * Get the user whose profile was visited.
     */
    public function visitedUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'visited_user_id');
    }
}
