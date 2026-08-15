<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserPresenceTest extends TestCase
{
    use RefreshDatabase;

    protected function createMember(array $attributes = []): User
    {
        $user = User::factory()->create($attributes + [
            'is_verified' => true,
            'is_banned' => false,
        ]);

        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(30),
            'is_discoverable' => true,
        ]);

        return $user;
    }

    public function test_browsing_marks_the_member_as_online(): void
    {
        $user = $this->createMember(['last_activity_at' => null, 'last_login_at' => null]);

        $this->assertFalse($user->is_online);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();

        $this->assertNotNull(
            $user->fresh()->last_activity_at,
            'La navigation doit entretenir la présence.'
        );
        $this->assertTrue($user->fresh()->is_online);
    }

    public function test_a_member_inactive_for_too_long_is_offline(): void
    {
        $user = $this->createMember(['last_activity_at' => now()->subMinutes(20)]);

        $this->assertFalse($user->is_online);
    }

    public function test_last_login_is_used_when_activity_is_unknown(): void
    {
        $user = $this->createMember([
            'last_activity_at' => null,
            'last_login_at' => now()->subMinutes(5),
        ]);

        $this->assertTrue(
            $user->is_online,
            'Les comptes antérieurs au suivi doivent rester détectables via last_login_at.'
        );
    }

    public function test_the_online_scope_matches_the_attribute(): void
    {
        $online = $this->createMember(['last_activity_at' => now()->subMinutes(2)]);
        $offline = $this->createMember(['last_activity_at' => now()->subHour(), 'last_login_at' => null]);

        $ids = User::online()->pluck('id');

        $this->assertContains($online->id, $ids);
        $this->assertNotContains($offline->id, $ids);
    }

    public function test_the_dashboard_counts_other_members_online(): void
    {
        $me = $this->createMember();
        $onlineOther = $this->createMember(['last_activity_at' => now()]);
        $this->createMember(['last_activity_at' => now()->subHour(), 'last_login_at' => null]);

        $signals = $this->actingAs($me)
            ->get(route('dashboard'))
            ->viewData('page')['props']['liveSignals'];

        $this->assertSame(1, $signals['online_count']);
        $this->assertTrue($onlineOther->fresh()->is_online);
    }
}
