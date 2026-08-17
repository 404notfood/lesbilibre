<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Photo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ConversationAvatarTest extends TestCase
{
    use RefreshDatabase;

    public function test_conversation_list_exposes_the_secure_avatar_url(): void
    {
        [$viewer, $other, $conversation, $avatar] = $this->conversationWithAvatar();

        $this->actingAs($viewer)
            ->get(route('conversations.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Chat/Index')
                ->has('conversations', 1)
                ->where('conversations.0.id', $conversation->id)
                ->where('conversations.0.other_user.id', $other->id)
                ->where(
                    'conversations.0.other_user.avatar_url',
                    $avatar->viewUrl(thumbnail: true)
                )
                ->missing('conversations.0.other_user.photos')
            );
    }

    public function test_conversation_header_exposes_the_same_secure_avatar_url(): void
    {
        [$viewer, $other, $conversation, $avatar] = $this->conversationWithAvatar();

        $this->actingAs($viewer)
            ->get(route('conversations.show', $conversation))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Chat/Show')
                ->where('otherUser.id', $other->id)
                ->where('otherUser.avatar_url', $avatar->viewUrl(thumbnail: true))
                ->missing('otherUser.photos')
            );
    }

    public function test_an_ineligible_media_is_never_used_as_a_conversation_avatar(): void
    {
        $viewer = User::factory()->create();
        $other = User::factory()->create();
        $conversation = Conversation::factory()->between($viewer, $other)->create();

        Photo::factory()->primary()->create([
            'user_id' => $other->id,
            'is_naughty' => true,
        ]);

        $this->actingAs($viewer)
            ->get(route('conversations.show', $conversation))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('otherUser.avatar_url', null)
            );
    }

    /**
     * @return array{User, User, Conversation, Photo}
     */
    private function conversationWithAvatar(): array
    {
        $viewer = User::factory()->create();
        $other = User::factory()->create();
        $conversation = Conversation::factory()->between($viewer, $other)->create();
        $avatar = Photo::factory()->primary()->create([
            'user_id' => $other->id,
            'media_type' => 'photo',
            'is_private' => false,
        ]);

        return [$viewer, $other, $conversation, $avatar];
    }
}
