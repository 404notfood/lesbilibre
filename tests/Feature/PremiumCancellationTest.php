<?php

namespace Tests\Feature;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PremiumCancellationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_member_can_cancel_her_own_subscription(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->addMonth(),
        ]);

        $subscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
            'expires_at' => now()->addMonth(),
            'payment_method' => 'admin',
            'stripe_customer_id' => null,
            'stripe_subscription_id' => null,
        ]);

        $this->actingAs($user)
            ->post('/premium/cancel')
            ->assertRedirect();

        $this->assertSame('canceled', $subscription->fresh()->status);
    }

    public function test_access_is_kept_until_the_period_already_paid_for(): void
    {
        $endsAt = now()->addMonth();

        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => $endsAt,
        ]);

        Subscription::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
            'expires_at' => $endsAt,
            'payment_method' => 'admin',
            'stripe_customer_id' => null,
            'stripe_subscription_id' => null,
        ]);

        $this->actingAs($user)->post('/premium/cancel');

        $user->refresh();

        $this->assertTrue($user->is_premium);
        $this->assertTrue($user->isPremium());
        $this->assertSame(
            $endsAt->toDateString(),
            $user->premium_expires_at->toDateString(),
        );
    }

    public function test_a_stripe_subscription_must_go_through_the_billing_portal(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->addMonth(),
        ]);

        $subscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'status' => 'active',
            'expires_at' => now()->addMonth(),
            'stripe_customer_id' => 'cus_test',
        ]);

        $this->actingAs($user)
            ->post('/premium/cancel')
            ->assertSessionHas('error');

        $this->assertSame('active', $subscription->fresh()->status);
        $this->assertTrue($user->fresh()->is_premium);
    }

    public function test_cancelling_without_a_subscription_reports_an_error(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/premium/cancel')
            ->assertSessionHas('error');
    }

    public function test_guests_cannot_cancel(): void
    {
        $this->post('/premium/cancel')->assertRedirect('/login');
    }

    public function test_a_premium_member_without_any_subscription_row_can_still_stop_it(): void
    {
        // Premium posé à la main sur le compte (console admin, seeder, geste
        // commercial) : aucune ligne d'abonnement n'existe, mais la membre doit
        // pouvoir couper son premium elle-même.
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->addMonth(),
        ]);

        $this->assertCount(0, $user->subscriptions);

        $this->actingAs($user)
            ->post('/premium/cancel')
            ->assertRedirect()
            ->assertSessionHas('success');

        $user->refresh();

        $this->assertTrue($user->is_premium, 'accès conservé jusqu’à l’échéance payée');

        $this->travelTo(now()->addMonths(2));
        $this->assertFalse($user->isPremium(), 'le premium ne se prolonge pas');
    }

    public function test_an_unlimited_premium_granted_by_hand_stops_immediately(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => null,
        ]);

        $this->actingAs($user)
            ->post('/premium/cancel')
            ->assertSessionHas('success');

        $user->refresh();

        $this->assertFalse($user->is_premium);
        $this->assertFalse($user->isPremium());
    }

    public function test_the_premium_page_exposes_the_cancellation_state(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->addMonth(),
        ]);

        $this->actingAs($user)
            ->get('/premium')
            ->assertOk()
            ->assertInertia(
                fn ($page) => $page
                    ->where('isPremium', true)
                    ->where('canCancel', true)
                    ->where('premiumState.managed_by_stripe', false)
            );
    }
}
