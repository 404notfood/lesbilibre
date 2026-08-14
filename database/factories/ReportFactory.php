<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Report>
 */
class ReportFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'reporter_id' => User::factory(),
            'reported_user_id' => User::factory(),
            'reason' => fake()->randomElement([
                'spam',
                'harassment',
                'fake_profile',
                'inappropriate_content',
                'other',
            ]),
            'description' => fake()->sentence(12),
            'status' => 'pending',
            'admin_notes' => null,
        ];
    }

    /**
     * Indicate that the report has been reviewed.
     */
    public function reviewed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'reviewed',
        ]);
    }

    /**
     * Indicate that the report led to a sanction.
     */
    public function actioned(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'actioned',
        ]);
    }

    /**
     * Indicate that the report was dismissed.
     */
    public function dismissed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'dismissed',
        ]);
    }
}
