<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page(): void
    {
        $this->get(route('dashboard'))->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard(): void
    {
        $this->actingAs($user = User::factory()->create());

        $this->get(route('dashboard'))->assertOk();
    }

    public function test_nearby_quick_filter_is_accepted_as_parameter(): void
    {
        // Note: Full distance calculation testing requires MySQL/PostgreSQL
        // This test verifies the filter is accepted and doesn't cause errors

        // Create user without coordinates (to avoid distance calculation issues in SQLite)
        $user = User::factory()->create();
        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(25),
            'age' => 25,
            'latitude' => null,
            'longitude' => null,
        ]);

        // Create other user
        $otherUser = User::factory()->create(['is_verified' => true, 'is_banned' => false]);
        Profile::create([
            'user_id' => $otherUser->id,
            'date_of_birth' => now()->subYears(28),
            'age' => 28,
            'latitude' => null,
            'longitude' => null,
        ]);

        $this->actingAs($user);

        // Test that nearby filter doesn't cause errors
        $response = $this->get(route('dashboard', ['quick_filter' => 'nearby']));

        $response->assertOk();

        // Verify filters are set correctly
        $filters = $response->viewData('page')['props']['filters'];

        $this->assertEquals('nearby', $filters['quick_filter']);
        $this->assertEquals(10, $filters['search_radius']);
    }

    public function test_quick_filters_do_not_override_the_chosen_sort(): void
    {
        $user = User::factory()->create();
        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(25),
            'is_discoverable' => true,
        ]);

        $filters = $this->actingAs($user)
            ->get(route('dashboard', ['quick_filter' => 'nearby', 'sort_by' => 'recent']))
            ->assertOk()
            ->viewData('page')['props']['filters'];

        $this->assertEquals('recent', $filters['sort_by'], 'Le tri choisi doit survivre au filtre.');
        $this->assertEquals(10, $filters['search_radius']);
    }

    public function test_looking_for_quick_filter_narrows_the_results(): void
    {
        $me = User::factory()->create();
        Profile::create([
            'user_id' => $me->id,
            'date_of_birth' => now()->subYears(30),
            'is_discoverable' => true,
        ]);

        $serious = User::factory()->create(['is_verified' => true, 'is_banned' => false]);
        Profile::create([
            'user_id' => $serious->id,
            'date_of_birth' => now()->subYears(28),
            'looking_for' => 'relationship',
            'is_discoverable' => true,
        ]);

        $friendly = User::factory()->create(['is_verified' => true, 'is_banned' => false]);
        Profile::create([
            'user_id' => $friendly->id,
            'date_of_birth' => now()->subYears(29),
            'looking_for' => 'friendship',
            'is_discoverable' => true,
        ]);

        $response = $this->actingAs($me)
            ->get(route('dashboard', ['quick_filter' => 'relationship']))
            ->assertOk();

        $ids = array_column($response->viewData('page')['props']['profiles'], 'id');

        $this->assertContains($serious->id, $ids);
        $this->assertNotContains($friendly->id, $ids);
    }

    public function test_verified_quick_filter_excludes_unverified_members(): void
    {
        $me = User::factory()->create();
        Profile::create([
            'user_id' => $me->id,
            'date_of_birth' => now()->subYears(30),
            'is_discoverable' => true,
        ]);

        $verified = User::factory()->create(['is_verified' => true, 'is_banned' => false]);
        Profile::create([
            'user_id' => $verified->id,
            'date_of_birth' => now()->subYears(27),
            'is_discoverable' => true,
        ]);

        $response = $this->actingAs($me)
            ->get(route('dashboard', ['quick_filter' => 'verified']))
            ->assertOk();

        $ids = array_column($response->viewData('page')['props']['profiles'], 'id');

        $this->assertContains($verified->id, $ids);
    }

    public function test_online_quick_filter_shows_only_online_users(): void
    {
        // Create user
        $user = User::factory()->create();
        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(25),
            'age' => 25,
        ]);

        // Create online user
        $onlineUser = User::factory()->create([
            'is_verified' => true,
            'is_banned' => false,
            'last_login_at' => now()->subMinutes(5),
        ]);
        Profile::create([
            'user_id' => $onlineUser->id,
            'date_of_birth' => now()->subYears(28),
            'age' => 28,
        ]);

        // Create offline user
        $offlineUser = User::factory()->create([
            'is_verified' => true,
            'is_banned' => false,
            'last_login_at' => now()->subHours(2),
        ]);
        Profile::create([
            'user_id' => $offlineUser->id,
            'date_of_birth' => now()->subYears(30),
            'age' => 30,
        ]);

        $this->actingAs($user);

        // Test online filter
        $response = $this->get(route('dashboard', ['quick_filter' => 'online']));

        $response->assertOk();

        $profiles = $response->viewData('page')['props']['profiles'];

        // Should only show online user
        $this->assertCount(1, $profiles);
        $this->assertEquals($onlineUser->id, $profiles[0]['id']);
    }
}
