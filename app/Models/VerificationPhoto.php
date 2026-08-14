<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationPhoto extends Model
{
    /** @use HasFactory<\Database\Factories\VerificationPhotoFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'path',
        'challenge_code',
        'status',
        'rejection_reason',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    /**
     * Get the user that owns the verification photo.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
