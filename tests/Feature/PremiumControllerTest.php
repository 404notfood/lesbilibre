<?php

namespace Tests\Feature;

use App\Models\PremiumPlan;
use App\Models\User;
use App\Services\StripePaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Mockery\MockInterface;
use Tests\TestCase;

class PremiumControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_premium_index_shows_plans(): void
    {
        $user = User::factory()->create();
        PremiumPlan::factory()->count(3)->create();

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
        $plan = PremiumPlan::factory()->create();

        $this->mock(StripePaymentService::class, function (MockInterface $mock) use ($plan, $user) {
            $mock->shouldReceive('createPremiumSubscription')
                ->once()
                ->with($plan->stripe_price_id, $user->id)
                ->andReturn('https://checkout.stripe.test/premium');
        });

        $response = $this->actingAs($user)->post(route('premium.subscribe'), [
            'plan_id' => $plan->id,
        ]);

        $response->assertRedirect('https://checkout.stripe.test/premium');

        $user->refresh();
        $this->assertFalse($user->is_premium);
        $this->assertNull($user->premium_expires_at);
        $this->assertSame(0, $user->gems);
        $this->assertDatabaseMissing('subscriptions', ['user_id' => $user->id]);
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
