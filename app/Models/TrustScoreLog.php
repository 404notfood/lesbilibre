<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrustScoreLog extends Model
{
    /** @use HasFactory<\Database\Factories\TrustScoreLogFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'previous_score',
        'new_score',
        'reason',
        'points_change',
    ];

    protected function casts(): array
    {
        return [
            'previous_score' => 'integer',
            'new_score' => 'integer',
            'points_change' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
