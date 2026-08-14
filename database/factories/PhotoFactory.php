<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Photo>
 */
class PhotoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = Str::random(40);

        return [
            'user_id' => User::factory(),
            'path' => "photos/{$name}.jpg",
            'thumbnail_path' => "photos/thumbnails/{$name}.jpg",
            'content_hash' => hash('sha256', $name),
            'moderation_status' => 'pending',
            'is_primary' => false,
            'is_approved' => false,
            'is_naughty' => false,
            'order' => 0,
            'rejection_reason' => null,
        ];
    }

    /**
     * Indicate that the photo passed moderation.
     */
    public function approved(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_approved' => true,
            'moderation_status' => 'approved',
        ]);
    }

    /**
     * Indicate that the photo was refused by a moderator.
     */
    public function rejected(string $reason = 'Photo non conforme.'): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_approved' => false,
            'moderation_status' => 'rejected',
            'rejection_reason' => $reason,
        ]);
    }

    /**
     * Indicate that the photo is the profile's primary picture.
     */
    public function primary(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_primary' => true,
            'is_approved' => true,
            'moderation_status' => 'approved',
        ]);
    }
}
