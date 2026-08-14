<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class NaughtyInterest extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'category',
        'emoji',
        'image_url',
    ];

    public function profiles(): BelongsToMany
    {
        return $this->belongsToMany(Profile::class, 'profile_naughty_interest');
    }
}
