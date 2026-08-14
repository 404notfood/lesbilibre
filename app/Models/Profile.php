<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Profile extends Model
{
    /** @use HasFactory<\Database\Factories\ProfileFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bio',
        'date_of_birth',
        'age',
        'city',
        'postal_code',
        'country',
        'latitude',
        'longitude',
        'sexual_orientation',
        'interested_in',
        'looking_for',
        'relationship_status',
        'height',
        'body_type',
        'hair_color',
        'eye_color',
        'ethnicity',
        'education',
        'occupation',
        'has_children',
        'wants_children',
        'smokes',
        'drinks',
        'interests',
        'languages',
        'is_naughty_mode',
        'is_discoverable',
        'incognito_mode',
        'message_permission',
        'show_age',
        'show_location',
        'search_radius',
        'min_age_preference',
        'max_age_preference',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'age' => 'integer',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'has_children' => 'boolean',
        'wants_children' => 'boolean',
        'smokes' => 'boolean',
        'drinks' => 'boolean',
        'interests' => 'array',
        'languages' => 'array',
        'is_naughty_mode' => 'boolean',
        'is_discoverable' => 'boolean',
        'incognito_mode' => 'boolean',
        'show_age' => 'boolean',
        'show_location' => 'boolean',
        'search_radius' => 'integer',
        'min_age_preference' => 'integer',
        'max_age_preference' => 'integer',
    ];

    /**
     * Get the user that owns the profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the age of the user.
     */
    public function getAgeAttribute(): int
    {
        return $this->date_of_birth->age;
    }

    /**
     * Get the naughty interests for the profile.
     */
    public function naughtyInterests(): BelongsToMany
    {
        return $this->belongsToMany(NaughtyInterest::class, 'profile_naughty_interest');
    }
}
