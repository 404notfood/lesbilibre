<?php

namespace Tests\Feature;

use App\Models\GemPackage;
use App\Models\PremiumPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class BillingCatalogUsageTest extends TestCase
{
    use RefreshDatabase;

    // --- Premium page reads the database ---

    public function test_premium_page_lists_active_plans_only(): void
    {
        $user = User::factory()->create();
        PremiumPlan::factory()->create(['name' => 'Visible', 'display_order' => 1]);
        PremiumPlan::factory()->inactive()->create(['name' => 'Masqué']);

        $this->actingAs($user)
            ->get(route('premium.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('plans', 1)
                ->where('plans.0.duration', 'Visible')
            );
    }

    public function test_premium_plans_follow_the_display_order(): void
    {
        $user = User::factory()->create();
        PremiumPlan::factory()->create(['name' => 'Second', 'display_order' => 2]);
        PremiumPlan::factory()->create(['name' => 'Premier', 'display_order' => 1]);

        $this->actingAs($user)
            ->get(route('premium.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('plans.0.duration', 'Premier')
                ->where('plans.1.duration', 'Second')
            );
    }

    public function test_premium_page_exposes_perks_and_savings(): void
    {
        $user = User::factory()->create();
        PremiumPlan::factory()->create([
            'name' => 'Mensuel',
            'duration_months' => 1,
            'price' => 20.00,
            'display_order' => 1,
            'perks' => ['Likes illimités'],
        ]);
        PremiumPlan::factory()->featured()->create([
            'name' => 'Semestriel',
            'duration_months' => 6,
            'price' => 60.00,
            'display_order' => 2,
            'perks' => ['Likes illimités', 'Boost mensuel'],
        ]);

        $this->actingAs($user)
            ->get(route('premium.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->where('plans.0.savings', 0)
                // 10 €/mois contre 20 €/mois de référence : 50 % d'économie.
                ->where('plans.1.savings', 50)
                ->where('plans.1.popular', true)
                ->where('plans.1.perks', ['Likes illimités', 'Boost mensuel'])
            );
    }

    public function test_subscribing_to_an_inactive_plan_is_refused(): void
    {
        $user = User::factory()->create();
        $plan = PremiumPlan::factory()->inactive()->create();

        $this->actingAs($user)
            ->post(route('premium.subscribe'), ['plan_id' => $plan->id])
            ->assertRedirect();
    }

    public function test_subscribing_to_a_plan_without_stripe_price_is_refused(): void
    {
        $user = User::factory()->create();
        $plan = PremiumPlan::factory()->withoutStripePrice()->create();

        $this->actingAs($user)
            ->post(route('premium.subscribe'), ['plan_id' => $plan->id])
            ->assertRedirect()
            ->assertSessionHas('error');
    }

    public function test_subscribing_to_an_unknown_plan_fails_validation(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('premium.subscribe'), ['plan_id' => 999999])
            ->assertSessionHasErrors('plan_id');
    }

    // --- Shop page reads the database ---

    public function test_shop_lists_active_packages_only(): void
    {
        $user = User::factory()->create();
        GemPackage::factory()->create(['name' => 'En vente', 'display_order' => 1]);
        GemPackage::factory()->inactive()->create(['name' => 'Retiré']);

        $this->actingAs($user)
            ->get(route('shop.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('gemPackages', 1)
                ->where('gemPackages.0.name', 'En vente')
            );
    }

    public function test_purchasing_an_inactive_package_is_refused(): void
    {
        $user = User::factory()->create();
        $package = GemPackage::factory()->inactive()->create();

        $this->actingAs($user)
            ->post(route('shop.gems.purchase'), ['package_id' => $package->id])
            ->assertRedirect();
    }

    public function test_purchasing_an_unknown_package_fails_validation(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('shop.gems.purchase'), ['package_id' => 999999])
            ->assertSessionHasErrors('package_id');
    }

    // --- Model helpers ---

    public function test_total_gems_adds_the_bonus(): void
    {
        $package = GemPackage::factory()->create(['amount' => 500, 'bonus' => 75]);

        $this->assertSame(575, $package->totalGems());
    }

    public function test_price_per_month_divides_by_the_duration(): void
    {
        $plan = PremiumPlan::factory()->create([
            'duration_months' => 6,
            'price' => 69.99,
        ]);

        $this->assertSame(11.67, $plan->pricePerMonth());
    }
}
