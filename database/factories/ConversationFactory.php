<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Conversation>
 */
class ConversationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user1_id' => User::factory(),
            'user2_id' => User::factory(),
            'last_message_at' => now(),
        ];
    }

    /**
     * A conversation between two specific members.
     */
    public function between(User $first, User $second): static
    {
        return $this->state(fn (array $attributes): array => [
            'user1_id' => $first->id,
            'user2_id' => $second->id,
        ]);
    }
}
