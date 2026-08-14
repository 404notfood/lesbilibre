<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\VerificationPhoto>
 */
class VerificationPhotoFactory extends Factory
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
            'path' => 'verifications/'.Str::random(40).'.jpg',
            'status' => 'pending',
            'rejection_reason' => null,
            'verified_at' => null,
        ];
    }

    /**
     * Indicate that the verification was approved.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'approved',
            'verified_at' => now(),
        ]);
    }

    /**
     * Indicate that the verification was refused.
     */
    public function rejected(string $reason = 'Selfie illisible.'): static
    {
        return $this->state(fn (array $attributes): array => [
            'status' => 'rejected',
            'rejection_reason' => $reason,
        ]);
    }
}
