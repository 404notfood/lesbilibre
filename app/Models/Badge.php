<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Badge extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'description',
        'icon',
        'color',
        'criteria',
        'points',
        'rarity',
        'is_active',
    ];

    protected $casts = [
        'criteria' => 'array',
        'is_active' => 'boolean',
        'points' => 'integer',
    ];

    /**
     * Users who have earned this badge.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_badges')
            ->withPivot('progress', 'awarded_at')
            ->withTimestamps();
    }

    /**
     * Check if this badge is awarded.
     */
    public function isAwarded(): bool
    {
        return $this->pivot && $this->pivot->awarded_at !== null;
    }

    /**
     * Get rarity color.
     */
    public function getRarityColorAttribute(): string
    {
        return match ($this->rarity) {
            'common' => '#6B7280',
            'rare' => '#3B82F6',
            'epic' => '#8B5CF6',
            'legendary' => '#F59E0B',
            default => '#6B7280',
        };
    }
}
