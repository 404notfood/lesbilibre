<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Profile>
 */
class ProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'bio' => fake()->sentence(12),
            'date_of_birth' => fake()->dateTimeBetween('-45 years', '-19 years')->format('Y-m-d'),
            'city' => fake()->city(),
            'country' => 'France',
            'sexual_orientation' => fake()->randomElement([
                'lesbian', 'bisexual', 'pansexual', 'queer', 'other',
            ]),
            'relationship_status' => 'single',
            'occupation' => fake()->jobTitle(),
            'interests' => fake()->randomElements(
                ['cinéma', 'randonnée', 'cuisine', 'musique', 'voyages', 'lecture'],
                3
            ),
            'languages' => ['français'],
            'is_naughty_mode' => false,
            'show_age' => true,
            'show_location' => true,
        ];
    }

    /**
     * Indicate that the member opted into adult content.
     */
    public function naughtyMode(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_naughty_mode' => true,
        ]);
    }
}
