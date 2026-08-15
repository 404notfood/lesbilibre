<?php

namespace Tests\Feature;

use App\Models\Like;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityBadgeTest extends TestCase
{
    use RefreshDatabase;

    protected function createMember(): User
    {
        $user = User::factory()->create([
            'is_verified' => true,
            'is_banned' => false,
        ]);

        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(30),
        ]);

        return $user;
    }

    protected function badgeCountFor(User $user): int
    {
        return $this->actingAs($user)
            ->get(route('dashboard'))
            ->viewData('page')['props']['counts']['recentActivities'];
    }

    public function test_a_new_like_raises_the_activity_badge(): void
    {
        $me = $this->createMember();
        $liker = $this->createMember();

        Like::create(['user_id' => $liker->id, 'liked_user_id' => $me->id]);

        $this->assertSame(1, $this->badgeCountFor($me));
    }

    public function test_visiting_the_activity_page_clears_the_badge(): void
    {
        $me = $this->createMember();
        $liker = $this->createMember();

        Like::create(['user_id' => $liker->id, 'liked_user_id' => $me->id]);

        $this->assertSame(1, $this->badgeCountFor($me));

        $this->actingAs($me)->get(route('activity'))->assertOk();

        $this->assertSame(
            0,
            $this->badgeCountFor($me),
            'La pastille doit retomber à zéro après consultation.'
        );
    }

    public function test_the_activity_page_still_shows_what_was_new(): void
    {
        $me = $this->createMember();
        $liker = $this->createMember();

        Like::create(['user_id' => $liker->id, 'liked_user_id' => $me->id]);

        $response = $this->actingAs($me)->get(route('activity'))->assertOk();

        // Le compteur partagé est calculé avant que le contrôleur ne marque
        // la page comme vue : la visite en cours reste visible.
        $this->assertSame(1, $response->viewData('page')['props']['counts']['recentActivities']);
    }

    public function test_a_like_received_after_the_visit_raises_the_badge_again(): void
    {
        $me = $this->createMember();
        $liker = $this->createMember();
        $secondLiker = $this->createMember();

        Like::create(['user_id' => $liker->id, 'liked_user_id' => $me->id]);
        $this->actingAs($me)->get(route('activity'))->assertOk();
        $this->assertSame(0, $this->badgeCountFor($me));

        $this->travel(1)->minutes();
        Like::create(['user_id' => $secondLiker->id, 'liked_user_id' => $me->id]);

        $this->assertSame(1, $this->badgeCountFor($me));
    }
}
