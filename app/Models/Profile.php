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

    protected $hidden = ['date_of_birth', 'birth_date_declared_at'];

    /** Public fields only; coordinates and account preferences stay on the server. */
    public function publicData(): array
    {
        $data = $this->only([
            'bio', 'meeting_intentions', 'boundaries', 'looking_for',
            'sexual_orientation', 'interested_in', 'relationship_status',
            'height', 'body_type', 'hair_color', 'eye_color', 'ethnicity',
            'education', 'occupation', 'has_children', 'wants_children',
            'smokes', 'drinks', 'interests', 'languages', 'is_naughty_mode',
            'show_age', 'show_location',
        ]);
        $data['age'] = $this->show_age ? $this->age : null;
        $data['city'] = $this->show_location ? $this->city : null;
        $data['country'] = $this->show_location ? $this->country : null;

        array_walk_recursive($data, function (&$value) {
            if (is_string($value)) {
                $value = preg_replace('/[A-Z0-9.!#$%&\x27*+\/=?^_`{|}~-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu', '[adresse masquée]', $value);
            }
        });

        return $data;
    }

    public function intentions(): array
    {
        return $this->meeting_intentions ?? ($this->looking_for ? [$this->looking_for] : []);
    }

    public function acceptsIntentionsOf(self $other): bool
    {
        $limits = $this->boundaries ?? [];
        $mine = in_array('friendship_only', $limits, true) ? ['friendship'] : $this->intentions();
        $theirs = $other->intentions();
        if (in_array('no_sexual_requests', $limits, true)) {
            $theirs = array_diff($theirs, ['casual', 'ongoing']);
        }

        return count(array_intersect($mine, $theirs)) > 0;
    }

    protected $fillable = [
        'user_id',
        'birth_date_declared_at',
        'meeting_intentions',
        'boundaries',
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
        'birth_date_declared_at' => 'datetime',
        'meeting_intentions' => 'array',
        'boundaries' => 'array',
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
     *
     * Retombe sur la colonne `age` lorsque `date_of_birth` n'est pas chargée
     * (select partiel) ou absente, plutôt que de lever une erreur.
     */
    public function getAgeAttribute(): ?int
    {
        if ($this->date_of_birth !== null) {
            return $this->date_of_birth->age;
        }

        $storedAge = $this->attributes['age'] ?? null;

        return $storedAge !== null ? (int) $storedAge : null;
    }

    /**
     * Get the naughty interests for the profile.
     */
    public function naughtyInterests(): BelongsToMany
    {
        return $this->belongsToMany(NaughtyInterest::class, 'profile_naughty_interest');
    }
}
