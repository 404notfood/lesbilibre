<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PremiumPlan extends Model
{
    /** @use HasFactory<\Database\Factories\PremiumPlanFactory> */
    use HasFactory;

    protected $fillable = [
        'slug',
        'name',
        'tagline',
        'duration_months',
        'price',
        'stripe_price_id',
        'perks',
        'gems_on_signup',
        'gems_per_month',
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
            'perks' => 'array',
            'price' => 'decimal:2',
            'duration_months' => 'integer',
            'gems_on_signup' => 'integer',
            'gems_per_month' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'display_order' => 'integer',
        ];
    }

    /**
     * Only plans that may be offered to members, in display order.
     *
     * @param  Builder<PremiumPlan>  $query
     * @return Builder<PremiumPlan>
     */
    public function scopeOffered(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('duration_months');
    }

    /**
     * Monthly cost, used to advertise longer plans as better value.
     */
    public function pricePerMonth(): float
    {
        if ($this->duration_months < 1) {
            return (float) $this->price;
        }

        return round((float) $this->price / $this->duration_months, 2);
    }

    /**
     * Discount against the cheapest per-month plan, as a whole percentage.
     * Returns 0 when this plan is the reference or the only one.
     */
    public function savingsPercent(?float $referencePerMonth = null): int
    {
        $reference = $referencePerMonth
            ?? (float) (static::offered()->orderBy('duration_months')->value('price') ?? 0);

        if ($reference <= 0) {
            return 0;
        }

        $savings = (1 - ($this->pricePerMonth() / $reference)) * 100;

        return $savings > 0 ? (int) round($savings) : 0;
    }

    /**
     * A plan cannot be sold through Stripe without its price identifier.
     */
    public function isPurchasable(): bool
    {
        return $this->is_active && ! empty($this->stripe_price_id);
    }
}
