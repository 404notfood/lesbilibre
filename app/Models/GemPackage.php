<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GemPackage extends Model
{
    /** @use HasFactory<\Database\Factories\GemPackageFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'amount',
        'bonus',
        'price',
        'stripe_price_id',
        'is_active',
        'is_featured',
        'display_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'bonus' => 'integer',
            'price' => 'decimal:2',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    /**
     * Only packages that may be offered to members, in display order.
     *
     * @param  Builder<GemPackage>  $query
     * @return Builder<GemPackage>
     */
    public function scopeOffered(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('amount');
    }

    /**
     * Gems actually credited: the base amount plus any bonus.
     */
    public function totalGems(): int
    {
        return $this->amount + $this->bonus;
    }
}
