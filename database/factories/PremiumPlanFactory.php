<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PremiumPlan>
 */
class PremiumPlanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $months = fake()->randomElement([1, 3, 6, 12]);

        return [
            'slug' => Str::slug(fake()->unique()->words(2, true)),
            'name' => "{$months} mois",
            'tagline' => fake()->sentence(5),
            'duration_months' => $months,
            'price' => $months * 19.99,
            'stripe_price_id' => 'price_'.Str::random(20),
            'perks' => ['Likes illimités', 'Mode incognito'],
            'gems_on_signup' => 0,
            'gems_per_month' => 0,
            'is_active' => true,
            'is_featured' => false,
            'display_order' => $months,
        ];
    }

    /**
     * Indicate that the plan is hidden from members.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }

    /**
     * Indicate that the plan is highlighted on the premium page.
     */
    public function featured(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_featured' => true,
        ]);
    }

    /**
     * Indicate that the plan has no Stripe price and cannot be sold.
     */
    public function withoutStripePrice(): static
    {
        return $this->state(fn (array $attributes): array => [
            'stripe_price_id' => null,
        ]);
    }
}
