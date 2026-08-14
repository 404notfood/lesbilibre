<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TogglePremiumTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_toggle_premium(): void
    {
        $admin = User::factory()->create(['is_admin' => false]);
        $user = User::factory()->create();

        $this->actingAs($admin)
            ->post(route('admin.users.toggle-premium', $user))
            ->assertForbidden();
    }

    public function test_admin_can_activate_premium_with_expiration_date(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['is_premium' => false, 'premium_expires_at' => null]);

        $expiresAt = now()->addMonth()->format('Y-m-d');

        $this->actingAs($admin)
            ->post(route('admin.users.toggle-premium', $user), [
                'premium_expires_at' => $expiresAt,
            ])
            ->assertRedirect();

        $user->refresh();
        $this->assertTrue($user->is_premium);
        $this->assertEquals($expiresAt, $user->premium_expires_at->format('Y-m-d'));
        $this->assertTrue($user->isPremium());
    }

    public function test_admin_can_activate_unlimited_premium(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['is_premium' => false, 'premium_expires_at' => null]);

        $this->actingAs($admin)
            ->post(route('admin.users.toggle-premium', $user), [
                'premium_expires_at' => null,
            ])
            ->assertRedirect();

        $user->refresh();
        $this->assertTrue($user->is_premium);
        $this->assertNull($user->premium_expires_at);
        $this->assertTrue($user->isPremium());
    }

    public function test_admin_can_deactivate_premium(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->addMonth(),
        ]);

        $this->actingAs($admin)
            ->post(route('admin.users.toggle-premium', $user))
            ->assertRedirect();

        $user->refresh();
        $this->assertFalse($user->is_premium);
        $this->assertNull($user->premium_expires_at);
        $this->assertFalse($user->isPremium());
    }

    public function test_is_premium_returns_true_for_unlimited_premium(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => null,
        ]);

        $this->assertTrue($user->isPremium());
    }

    public function test_is_premium_returns_false_for_expired_premium(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->subDay(),
        ]);

        $this->assertFalse($user->isPremium());
    }

    public function test_premium_expires_at_must_be_after_today(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $user = User::factory()->create(['is_premium' => false]);

        $this->actingAs($admin)
            ->post(route('admin.users.toggle-premium', $user), [
                'premium_expires_at' => now()->subDay()->format('Y-m-d'),
            ])
            ->assertSessionHasErrors('premium_expires_at');
    }
}
