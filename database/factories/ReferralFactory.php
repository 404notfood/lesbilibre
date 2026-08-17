<?php

namespace Database\Factories;

use App\Models\Referral;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Referral>
 */
class ReferralFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'referrer_id' => User::factory(),
            'referred_user_id' => User::factory(),
            'code' => fake()->unique()->regexify('[A-Z0-9]{10}'),
            'status' => Referral::STATUS_PENDING,
        ];
    }

    public function rewarded(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Referral::STATUS_REWARDED,
            'referrer_reward' => 150,
            'referred_reward' => 50,
            'qualified_at' => now(),
            'rewarded_at' => now(),
        ]);
    }
}
