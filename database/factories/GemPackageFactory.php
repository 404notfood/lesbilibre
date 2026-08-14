<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GemPackage>
 */
class GemPackageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $amount = fake()->randomElement([100, 250, 500, 1000, 2500]);

        return [
            'name' => "Pack {$amount}",
            'amount' => $amount,
            'bonus' => (int) round($amount * 0.1),
            'price' => round($amount * 0.04, 2),
            'stripe_price_id' => null,
            'is_active' => true,
            'is_featured' => false,
            'display_order' => 0,
        ];
    }

    /**
     * Indicate that the package is hidden from the shop.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
