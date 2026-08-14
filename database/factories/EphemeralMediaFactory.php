<?php

namespace Database\Factories;

use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EphemeralMedia>
 */
class EphemeralMediaFactory extends Factory
{
    protected $model = EphemeralMedia::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'conversation_id' => Conversation::factory(),
            'sender_id' => User::factory(),
            'recipient_id' => User::factory(),
            'type' => 'photo',
            'path' => 'ephemeral/'.Str::uuid().'.jpg',
            'thumbnail_path' => null,
            'is_naughty' => false,
            'processing_status' => 'ready',
            'purge_after' => now()->addDays(EphemeralMedia::RETENTION_DAYS),
        ];
    }

    /**
     * Already opened once, replay window still running.
     */
    public function opened(): static
    {
        return $this->state(fn (array $attributes): array => [
            'first_viewed_at' => now()->subHour(),
            'replay_available_until' => now()->addHours(23),
        ]);
    }

    /**
     * Opened, replayed: nothing left to see.
     */
    public function replayed(): static
    {
        return $this->state(fn (array $attributes): array => [
            'first_viewed_at' => now()->subHours(2),
            'replay_available_until' => now()->addHours(22),
            'replayed_at' => now()->subHour(),
        ]);
    }

    /**
     * Opened long enough ago that the replay window has closed.
     */
    public function expired(): static
    {
        return $this->state(fn (array $attributes): array => [
            'first_viewed_at' => now()->subDays(2),
            'replay_available_until' => now()->subDay(),
        ]);
    }

    public function video(): static
    {
        return $this->state(fn (array $attributes): array => [
            'type' => 'video',
            'path' => 'ephemeral/'.Str::uuid().'.mp4',
            'thumbnail_path' => 'ephemeral/'.Str::uuid().'.jpg',
        ]);
    }

    public function flagged(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_flagged' => true,
        ]);
    }
}
