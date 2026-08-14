<?php

namespace Tests\Feature\Admin;

use App\Models\GemPackage;
use App\Models\PremiumPlan;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class BillingCatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_non_admin_cannot_reach_the_catalogue(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->get(route('admin.billing.index'))
            ->assertForbidden();
    }

    public function test_admin_sees_plans_and_packages(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PremiumPlan::factory()->create(['name' => 'Trimestre']);
        GemPackage::factory()->create(['name' => 'Coffre']);

        $this->actingAs($admin)
            ->get(route('admin.billing.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Billing/Index')
                ->has('plans', 1)
                ->where('plans.0.name', 'Trimestre')
                ->has('packages', 1)
                ->where('packages.0.name', 'Coffre')
            );
    }

    public function test_catalogue_flags_a_plan_without_a_stripe_price(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PremiumPlan::factory()->withoutStripePrice()->create();

        $this->actingAs($admin)
            ->get(route('admin.billing.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('plans.0.is_purchasable', false)
            );
    }

    public function test_admin_can_create_a_plan_with_perks_and_gems(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->post(route('admin.billing.plans.store'), [
                'slug' => '12-months',
                'name' => '12 mois',
                'tagline' => 'Une année entière',
                'duration_months' => 12,
                'price' => 119.99,
                'stripe_price_id' => 'price_year',
                'perks' => ['Likes illimités', 'Boost mensuel'],
                'gems_on_signup' => 500,
                'gems_per_month' => 50,
                'is_active' => true,
                'is_featured' => true,
                'display_order' => 4,
            ])
            ->assertRedirect();

        $plan = PremiumPlan::where('slug', '12-months')->first();

        $this->assertNotNull($plan);
        $this->assertSame(['Likes illimités', 'Boost mensuel'], $plan->perks);
        $this->assertSame(500, $plan->gems_on_signup);
        $this->assertSame(50, $plan->gems_per_month);
        $this->assertTrue($plan->is_featured);
    }

    public function test_plan_slug_must_be_unique(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        PremiumPlan::factory()->create(['slug' => '3-months']);

        $this->actingAs($admin)
            ->post(route('admin.billing.plans.store'), [
                'slug' => '3-months',
                'name' => 'Doublon',
                'duration_months' => 3,
                'price' => 44.99,
                'gems_on_signup' => 0,
                'gems_per_month' => 0,
                'display_order' => 1,
            ])
            ->assertSessionHasErrors('slug');
    }

    public function test_plan_slug_stays_valid_when_editing_the_same_plan(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $plan = PremiumPlan::factory()->create(['slug' => '3-months']);

        $this->actingAs($admin)
            ->put(route('admin.billing.plans.update', $plan), [
                'slug' => '3-months',
                'name' => 'Trimestre revu',
                'duration_months' => 3,
                'price' => 39.99,
                'gems_on_signup' => 0,
                'gems_per_month' => 0,
                'display_order' => 1,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertSame('Trimestre revu', $plan->fresh()->name);
        $this->assertSame('39.99', $plan->fresh()->price);
    }

    public function test_a_plan_with_active_subscribers_cannot_be_deleted(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $plan = PremiumPlan::factory()->create(['slug' => '3-months']);

        Subscription::create([
            'user_id' => User::factory()->create()->id,
            'plan' => '3-months',
            'amount' => 44.99,
            'status' => 'active',
            'starts_at' => now(),
            'expires_at' => now()->addMonths(3),
        ]);

        $this->actingAs($admin)
            ->delete(route('admin.billing.plans.destroy', $plan))
            ->assertRedirect();

        $this->assertDatabaseHas('premium_plans', ['id' => $plan->id]);
    }

    public function test_an_unused_plan_can_be_deleted(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $plan = PremiumPlan::factory()->create();

        $this->actingAs($admin)
            ->delete(route('admin.billing.plans.destroy', $plan))
            ->assertRedirect();

        $this->assertDatabaseMissing('premium_plans', ['id' => $plan->id]);
    }

    public function test_admin_can_create_a_gem_package(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->post(route('admin.billing.packages.store'), [
                'name' => 'Méga pack',
                'amount' => 5000,
                'bonus' => 1500,
                'price' => 149.99,
                'is_active' => true,
                'is_featured' => false,
                'display_order' => 6,
            ])
            ->assertRedirect();

        $package = GemPackage::where('name', 'Méga pack')->first();

        $this->assertNotNull($package);
        $this->assertSame(6500, $package->totalGems());
    }

    public function test_package_price_must_clear_the_stripe_minimum(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->post(route('admin.billing.packages.store'), [
                'name' => 'Trop peu',
                'amount' => 10,
                'bonus' => 0,
                'price' => 0.20,
                'display_order' => 0,
            ])
            ->assertSessionHasErrors('price');
    }

    public function test_catalogue_exposes_the_entitlement_definitions(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->get(route('admin.billing.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('entitlementCatalog')
                ->has('freeLimits.likes_per_day')
                ->has('freeLimits.first_messages_per_day')
            );
    }

    public function test_admin_can_grant_entitlements_on_a_plan(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->post(route('admin.billing.plans.store'), [
                'slug' => 'gold',
                'name' => 'Gold',
                'duration_months' => 1,
                'price' => 29.99,
                'gems_on_signup' => 0,
                'gems_per_month' => 0,
                'display_order' => 1,
                'entitlements' => [
                    'unlimited_likes' => true,
                    'first_messages_per_day' => 50,
                    'see_who_liked' => true,
                ],
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $plan = PremiumPlan::where('slug', 'gold')->first();

        $this->assertTrue($plan->entitlements['unlimited_likes']);
        $this->assertSame(50, $plan->entitlements['first_messages_per_day']);
    }

    public function test_unknown_entitlement_keys_are_discarded(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->post(route('admin.billing.plans.store'), [
                'slug' => 'forged',
                'name' => 'Forgé',
                'duration_months' => 1,
                'price' => 9.99,
                'gems_on_signup' => 0,
                'gems_per_month' => 0,
                'display_order' => 1,
                'entitlements' => [
                    'see_who_liked' => true,
                    'become_admin' => true,
                ],
            ])
            ->assertRedirect();

        $plan = PremiumPlan::where('slug', 'forged')->first();

        $this->assertArrayHasKey('see_who_liked', $plan->entitlements);
        $this->assertArrayNotHasKey('become_admin', $plan->entitlements);
    }

    public function test_a_quota_entitlement_rejects_a_non_numeric_value(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($admin)
            ->post(route('admin.billing.plans.store'), [
                'slug' => 'broken',
                'name' => 'Cassé',
                'duration_months' => 1,
                'price' => 9.99,
                'gems_on_signup' => 0,
                'gems_per_month' => 0,
                'display_order' => 1,
                'entitlements' => ['likes_per_day' => 'beaucoup'],
            ])
            ->assertSessionHasErrors('entitlements.likes_per_day');
    }

    public function test_non_admin_cannot_create_a_plan(): void
    {
        $user = User::factory()->create(['is_admin' => false]);

        $this->actingAs($user)
            ->post(route('admin.billing.plans.store'), [
                'slug' => 'pirate',
                'name' => 'Pirate',
                'duration_months' => 1,
                'price' => 0.01,
                'gems_on_signup' => 0,
                'gems_per_month' => 0,
                'display_order' => 0,
            ])
            ->assertForbidden();

        $this->assertDatabaseCount('premium_plans', 0);
    }
}
