<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GemTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'reason',
        'amount',
        'price',
        'balance_after',
        'description',
        'metadata',
        'payment_method',
        'transaction_id',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'price' => 'decimal:2',
            'balance_after' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
