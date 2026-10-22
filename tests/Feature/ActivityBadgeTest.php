<?php

namespace Tests\Feature;

use App\Models\BlockedUser;
use App\Models\Like;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ActivityBadgeTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_hall_of_fame_counts_likes_and_excludes_inaccessible_and_unliked_members(): void
    {
        $viewer = $this->createMember();
        $popular = $this->createMember();
        $lessPopular = $this->createMember();
        $blocked = $this->createMember();
        $this->createMember();
        $ineligible = User::factory()->create();
        $likers = User::factory()->communityMember()->count(4)->create();
        BlockedUser::create(['blocker_id' => $viewer->id, 'blocked_id' => $blocked->id]);

        foreach ($likers as $index => $liker) {
            foreach ([$viewer, $blocked, $ineligible] as $recipient) {
                Like::create(['user_id' => $liker->id, 'liked_user_id' => $recipient->id]);
            }
            if ($index < 3) {
                Like::create(['user_id' => $liker->id, 'liked_user_id' => $popular->id]);
            }
            if ($index === 0) {
                Like::create(['user_id' => $liker->id, 'liked_user_id' => $lessPopular->id]);
            }
        }

        $topUsers = $this->actingAs($viewer)->get(route('activity'))->assertOk()
            ->viewData('page')['props']['top_users'];

        $this->assertSame([$popular->id, $lessPopular->id], array_column($topUsers, 'id'));
        $this->assertEquals([3, 1], array_column($topUsers, 'likes_count'));
        $this->assertSame([1, 2], array_column($topUsers, 'rank'));
    }

    protected function createMember(): User
    {
        $user = User::factory()->communityMember()->create([
            'is_verified' => true,
            'is_banned' => false,
        ]);

        Profile::updateOrCreate(['user_id' => $user->id], [
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
