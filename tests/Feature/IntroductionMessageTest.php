<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Like;
use App\Models\Message;
use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IntroductionMessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_conversation_cannot_be_started_without_a_like(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        $this->actingAs($sender)
            ->post(route('conversations.store', $recipient->id))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseCount('conversations', 0);
    }

    public function test_a_liked_user_can_start_a_conversation(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        Like::create(['user_id' => $sender->id, 'liked_user_id' => $recipient->id]);

        $this->actingAs($sender)
            ->post(route('conversations.store', $recipient->id))
            ->assertRedirect();

        $this->assertDatabaseCount('conversations', 1);
    }

    public function test_a_second_message_is_refused_before_a_reply(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        Like::create(['user_id' => $sender->id, 'liked_user_id' => $recipient->id]);

        $conversation = Conversation::create([
            'user1_id' => min($sender->id, $recipient->id),
            'user2_id' => max($sender->id, $recipient->id),
        ]);

        $this->actingAs($sender)
            ->post(route('messages.store', $conversation), ['content' => 'Salut !'])
            ->assertRedirect();

        $this->actingAs($sender)
            ->post(route('messages.store', $conversation), ['content' => 'Tu es là ?'])
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseCount('messages', 1);
    }

    public function test_the_sender_can_write_again_once_the_recipient_replied(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();
        Like::create(['user_id' => $sender->id, 'liked_user_id' => $recipient->id]);

        $conversation = Conversation::create([
            'user1_id' => min($sender->id, $recipient->id),
            'user2_id' => max($sender->id, $recipient->id),
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $sender->id,
            'content' => 'Salut !',
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $recipient->id,
            'content' => 'Coucou !',
        ]);

        $this->actingAs($sender)
            ->post(route('messages.store', $conversation), ['content' => 'Ça va ?'])
            ->assertRedirect();

        $this->assertDatabaseCount('messages', 3);
    }

    public function test_matched_users_are_not_limited_to_a_single_message(): void
    {
        $sender = User::factory()->create();
        $recipient = User::factory()->create();

        UserMatch::create([
            'user1_id' => min($sender->id, $recipient->id),
            'user2_id' => max($sender->id, $recipient->id),
        ]);

        $conversation = Conversation::create([
            'user1_id' => min($sender->id, $recipient->id),
            'user2_id' => max($sender->id, $recipient->id),
        ]);

        $this->actingAs($sender)
            ->post(route('messages.store', $conversation), ['content' => 'Salut !'])
            ->assertRedirect();

        $this->actingAs($sender)
            ->post(route('messages.store', $conversation), ['content' => 'Comment vas-tu ?'])
            ->assertRedirect();

        $this->assertDatabaseCount('messages', 2);
    }
}
