<?php

namespace Tests\Feature;

use App\Models\BlockedUser;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlockedInteractionTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_blocked_user_cannot_view_the_blockers_profile(): void
    {
        $blocker = User::factory()->create();
        $blocked = User::factory()->create();
        BlockedUser::create(['blocker_id' => $blocker->id, 'blocked_id' => $blocked->id]);

        $this->actingAs($blocked)
            ->get(route('profile.view', $blocker))
            ->assertNotFound();
    }

    public function test_like_is_refused_when_either_user_has_blocked_the_other(): void
    {
        $blocker = User::factory()->create();
        $blocked = User::factory()->create();
        BlockedUser::create(['blocker_id' => $blocker->id, 'blocked_id' => $blocked->id]);

        $this->actingAs($blocked)
            ->post(route('likes.store', $blocker))
            ->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseMissing('likes', [
            'user_id' => $blocked->id,
            'liked_user_id' => $blocker->id,
        ]);
    }
}
