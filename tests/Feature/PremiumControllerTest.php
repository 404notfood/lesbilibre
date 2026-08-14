<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PremiumControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_premium_index_shows_plans(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('premium.index'));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Premium/Index')
            ->has('features', 8)
            ->has('plans', 3)
            ->where('isPremium', false)
        );
    }

    public function test_user_can_subscribe_to_premium(): void
    {
        $user = User::factory()->create([
            'is_premium' => false,
            'gems' => 0,
        ]);

        $response = $this->actingAs($user)->post(route('premium.subscribe'), [
            'plan_id' => 2, // 3 months
            'payment_method' => 'card',
        ]);

        $response->assertRedirect(route('premium.index'));
        $response->assertSessionHas('success');

        $user->refresh();
        $this->assertTrue($user->is_premium);
        $this->assertNotNull($user->premium_expires_at);
        $this->assertEquals(100, $user->gems); // Welcome bonus
        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'plan' => '3_months',
            'status' => 'active',
        ]);
    }

    public function test_premium_user_status_method(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->addDays(30),
        ]);

        $this->assertTrue($user->isPremium());

        $expiredUser = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->subDays(1),
        ]);

        $this->assertFalse($expiredUser->isPremium());
    }
}
