<?php

namespace Tests\Feature;

use App\Models\PremiumPlan;
use App\Models\Subscription;
use App\Models\User;
use App\Services\StripePaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LaunchPricingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['launch-pricing.plans.launch-monthly.stripe_price_id' => null, 'launch-pricing.plans.launch-quarterly.stripe_price_id' => null]);
    }

    public function test_launch_offers_replace_new_sales_without_repricing_existing_subscriptions(): void
    {
        $old = PremiumPlan::factory()->create(['slug' => '6-months', 'price' => 69.99, 'stripe_price_id' => 'price_old']);
        $subscription = Subscription::factory()->create(['plan' => $old->slug, 'amount' => 69.99, 'stripe_price_id' => 'price_old']);
        $this->artisan('billing:prepare-launch-catalog', ['--activate' => true])->assertSuccessful();
        $this->artisan('billing:prepare-launch-catalog', ['--activate' => true])->assertSuccessful();
        $this->assertFalse($old->fresh()->is_active);
        $this->assertSame('69.99', $old->fresh()->price);
        $this->assertSame('price_old', $subscription->fresh()->stripe_price_id);
        $this->assertEquals(69.99, $subscription->fresh()->amount);
        $plans = PremiumPlan::offered()->get();
        $this->assertCount(2, $plans);
        $this->assertSame([9.9, 24.9], $plans->map(fn ($plan) => (float) $plan->price)->all());
        $this->assertEquals(8.3, $plans[1]->pricePerMonth());
        $this->assertSame($plans[0]->entitlements, $plans[1]->entitlements);
        $this->assertFalse($plans[0]->entitlements['priority_messages']);
        $this->assertNull($plans[0]->stripe_price_id);
        $this->assertNull($plans[1]->stripe_price_id);
        $this->get('/tarifs')->assertOk()->assertInertia(fn ($page) => $page
            ->has('plans', 2)->where('plans.0.price', 9.9)->where('plans.1.price', 24.9)
            ->where('freeLimits.likesPerDay', config('entitlements.free.likes_per_day')));
    }

    public function test_unconfigured_launch_plan_cannot_start_a_payment(): void
    {
        $this->artisan('billing:prepare-launch-catalog', ['--activate' => true])->assertSuccessful();
        $this->mock(StripePaymentService::class, fn ($mock) => $mock->shouldNotReceive('createPremiumSubscription'));
        $this->actingAs(User::factory()->communityMember()->create())
            ->post('/premium/subscribe', ['plan_id' => PremiumPlan::where('slug', 'launch-monthly')->value('id')])
            ->assertRedirect()->assertSessionHas('error');
        $this->assertDatabaseCount('subscriptions', 0);
    }

    public function test_draft_preparation_and_seeding_do_not_overwrite_admin_prices(): void
    {
        $old = PremiumPlan::factory()->create();
        $this->artisan('billing:prepare-launch-catalog')->assertSuccessful();
        $this->assertTrue($old->fresh()->is_active);
        $this->assertFalse(PremiumPlan::where('slug', 'launch-monthly')->first()->is_active);
        PremiumPlan::where('slug', 'launch-monthly')->update(['price' => 8.90]);
        $this->seed(\Database\Seeders\BillingSeeder::class);
        $this->assertSame('8.90', PremiumPlan::where('slug', 'launch-monthly')->first()->price);
    }
}
