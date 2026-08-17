<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    /** @use HasFactory<\Database\Factories\ReferralFactory> */
    use HasFactory;

    public const STATUS_PENDING = 'pending';

    public const STATUS_REWARDED = 'rewarded';

    /** @var list<string> */
    protected $fillable = [
        'referrer_id',
        'referred_user_id',
        'code',
        'status',
        'referrer_reward',
        'referred_reward',
        'qualified_at',
        'rewarded_at',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'referrer_reward' => 'integer',
            'referred_reward' => 'integer',
            'qualified_at' => 'datetime',
            'rewarded_at' => 'datetime',
        ];
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    public function referredUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }
}
