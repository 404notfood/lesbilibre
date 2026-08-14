<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Subscription>
 */
class SubscriptionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startsAt = fake()->dateTimeBetween('-1 month', 'now');
        $expiresAt = (clone $startsAt)->modify('+1 month');

        return [
            'user_id' => \App\Models\User::factory(),
            'plan' => fake()->randomElement(['1_month', '3_months', '6_months']),
            'amount' => fake()->randomFloat(2, 5, 50),
            'status' => 'active',
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
            'payment_method' => 'stripe',
            'transaction_id' => 'txn_'.fake()->uuid(),
            'stripe_subscription_id' => 'sub_'.fake()->uuid(),
            'stripe_customer_id' => 'cus_'.fake()->uuid(),
            'stripe_price_id' => 'price_'.fake()->uuid(),
            'current_period_start' => $startsAt,
            'current_period_end' => $expiresAt,
        ];
    }
}
