<?php

namespace Tests\Feature\Admin;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExpireSubscriptionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_expires_subscriptions_past_their_end_date(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->subDay(),
        ]);

        $subscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
            'expires_at' => now()->subDay(),
        ]);

        $this->artisan('subscriptions:expire')->assertSuccessful();

        $this->assertSame('expired', $subscription->fresh()->status);
        $this->assertFalse($user->fresh()->is_premium);
        $this->assertNull($user->fresh()->premium_expires_at);
    }

    public function test_it_leaves_running_subscriptions_alone(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->addMonth(),
        ]);

        $subscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
            'expires_at' => now()->addMonth(),
        ]);

        $this->artisan('subscriptions:expire')->assertSuccessful();

        $this->assertSame('active', $subscription->fresh()->status);
        $this->assertTrue($user->fresh()->is_premium);
    }

    public function test_it_keeps_premium_when_another_subscription_is_still_running(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->addMonth(),
        ]);

        $lapsed = Subscription::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
            'expires_at' => now()->subDay(),
        ]);

        Subscription::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
            'expires_at' => now()->addMonth(),
        ]);

        $this->artisan('subscriptions:expire')->assertSuccessful();

        $this->assertSame('expired', $lapsed->fresh()->status);
        $this->assertTrue($user->fresh()->is_premium);
    }

    public function test_it_never_revokes_unlimited_premium_granted_by_hand(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => null,
        ]);

        $this->artisan('subscriptions:expire')->assertSuccessful();

        $this->assertTrue($user->fresh()->is_premium);
    }

    public function test_dry_run_reports_without_writing(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->subDay(),
        ]);

        $subscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
            'expires_at' => now()->subDay(),
        ]);

        $this->artisan('subscriptions:expire --dry-run')->assertSuccessful();

        $this->assertSame('active', $subscription->fresh()->status);
        $this->assertTrue($user->fresh()->is_premium);
    }
}
