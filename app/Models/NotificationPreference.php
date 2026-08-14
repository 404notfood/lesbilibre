<?php

namespace App\Models;

use App\Enums\NotificationFrequency;
use App\Enums\NotificationType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NotificationPreference extends Model
{
    /** @use HasFactory<\Database\Factories\NotificationPreferenceFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'frequency',
    ];

    protected function casts(): array
    {
        return [
            'type' => NotificationType::class,
            'frequency' => NotificationFrequency::class,
        ];
    }

    /**
     * Get the user owning this preference.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
