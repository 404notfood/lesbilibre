<?php

namespace Tests\Feature;

use App\Models\PremiumPlan;
use App\Models\StripeEvent;
use App\Models\Subscription;
use App\Models\User;
use App\Services\EntitlementService;
use App\Services\GemService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use RuntimeException;
use Tests\TestCase;

class StripeWebhookReliabilityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config(['services.stripe.webhook_secret' => 'whsec_synthetic_audit']);
    }

    private function deliver(string $id, string $type, array $object, ?int $created = null)
    {
        $event = ['id' => $id, 'type' => $type, 'created' => $created ?? time(), 'data' => ['object' => $object]];
        $payload = json_encode($event);
        $timestamp = time();

        return $this->postJson('/webhook/stripe', $event, ['Stripe-Signature' => 't='.$timestamp.',v1='.hash_hmac('sha256', $timestamp.'.'.$payload, 'whsec_synthetic_audit')]);
    }

    private function subscriptionPayload(User $user, PremiumPlan $plan, string $status = 'active', string $id = 'sub_synthetic'): array
    {
        return ['id' => $id, 'customer' => 'cus_synthetic', 'metadata' => ['user_id' => $user->id], 'status' => $status,
            'current_period_start' => now()->subMinute()->timestamp, 'current_period_end' => now()->addMonth()->timestamp,
            'items' => ['data' => [['price' => ['id' => $plan->stripe_price_id, 'unit_amount' => 990]]]]];
    }

    public function test_paid_subscription_grants_the_catalogue_entitlements_and_not_only_a_flag(): void
    {
        $user = User::factory()->create();
        $plan = PremiumPlan::factory()->create(['slug' => 'launch-synthetic', 'entitlements' => ['incognito' => true, 'unlimited_likes' => true]]);
        $this->deliver('evt_entitlement', 'customer.subscription.created', $this->subscriptionPayload($user, $plan))->assertOk();
        $this->assertDatabaseHas('subscriptions', ['user_id' => $user->id, 'plan' => $plan->slug]);
        $this->assertTrue(app(EntitlementService::class)->allows($user->fresh(), 'incognito'));
        $this->assertTrue(app(EntitlementService::class)->allows($user->fresh(), 'unlimited_likes'));
    }

    public function test_incomplete_or_expired_subscriptions_do_not_grant_premium(): void
    {
        $user = User::factory()->create();
        $plan = PremiumPlan::factory()->create();
        $payload = $this->subscriptionPayload($user, $plan, 'incomplete');
        $this->deliver('evt_incomplete', 'customer.subscription.created', $payload)->assertOk();
        $this->assertFalse($user->fresh()->isPremium());
        $payload['status'] = 'active';
        $payload['current_period_start'] = now()->subMonth()->timestamp;
        $payload['current_period_end'] = now()->subMinute()->timestamp;
        $this->deliver('evt_expired', 'customer.subscription.updated', $payload, time() + 1)->assertOk();
        $this->assertFalse($user->fresh()->isPremium());
    }

    public function test_failure_after_credit_rolls_back_the_business_effect_and_allows_one_retry(): void
    {
        $user = User::factory()->create(['gems' => 7]);
        $payload = ['id' => 'cs_retry', 'client_reference_id' => $user->id, 'payment_status' => 'paid', 'payment_intent' => 'pi_retry', 'amount_total' => 1000, 'metadata' => ['type' => 'gems', 'gems' => 100]];
        $actual = new GemService;
        $attempts = 0;
        $this->mock(GemService::class, function ($mock) use ($actual, &$attempts) {
            $mock->shouldReceive('addGems')->twice()->andReturnUsing(function (...$arguments) use ($actual, &$attempts) {
                $transaction = $actual->addGems(...$arguments);
                if ($attempts++ === 0) {
                    throw new RuntimeException('Synthetic post-credit failure');
                }

                return $transaction;
            });
        });
        $this->deliver('evt_retry', 'checkout.session.completed', $payload)->assertStatus(500);
        $this->assertSame(7, $user->fresh()->gems);
        $this->assertDatabaseCount('gem_transactions', 0);
        $this->assertFalse(StripeEvent::where('stripe_event_id', 'evt_retry')->first()->processed);
        $this->deliver('evt_retry', 'checkout.session.completed', $payload)->assertOk();
        $this->deliver('evt_retry', 'checkout.session.completed', $payload)->assertOk();
        $this->deliver('evt_other_same_session', 'checkout.session.completed', $payload)->assertOk();
        $this->assertSame(107, $user->fresh()->gems);
        $this->assertDatabaseCount('gem_transactions', 1);
    }

    public function test_an_unpaid_checkout_never_credits_gems(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        $payload = ['id' => 'cs_unpaid', 'client_reference_id' => $user->id, 'payment_status' => 'unpaid', 'metadata' => ['type' => 'gems', 'gems' => 100]];
        $this->deliver('evt_unpaid', 'checkout.session.completed', $payload)->assertOk();
        $this->assertSame(0, $user->fresh()->gems);
    }

    public function test_an_invoice_arriving_first_is_retryable_and_its_catalogue_bonus_is_not_duplicated(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        $plan = PremiumPlan::factory()->create(['gems_per_month' => 35]);
        $invoice = ['id' => 'in_ordering', 'subscription' => 'sub_synthetic'];
        $this->deliver('evt_invoice_early', 'invoice.payment_succeeded', $invoice)->assertStatus(500);
        $this->deliver('evt_sub_ready', 'customer.subscription.created', $this->subscriptionPayload($user, $plan))->assertOk();
        $this->deliver('evt_invoice_early', 'invoice.payment_succeeded', $invoice)->assertOk();
        $this->deliver('evt_invoice_duplicate_business', 'invoice.payment_succeeded', $invoice)->assertOk();
        $this->assertSame(35, $user->fresh()->gems);
        $this->assertDatabaseCount('gem_transactions', 1);
    }

    public function test_a_plan_without_a_bonus_never_receives_the_old_hardcoded_hundred_gems(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        $plan = PremiumPlan::factory()->create(['gems_per_month' => 0]);
        $this->deliver('evt_no_bonus_sub', 'customer.subscription.created', $this->subscriptionPayload($user, $plan))->assertOk();
        $this->deliver('evt_no_bonus_invoice', 'invoice.payment_succeeded', ['id' => 'in_no_bonus', 'subscription' => 'sub_synthetic'])->assertOk();
        $this->assertSame(0, $user->fresh()->gems);
    }

    public function test_a_late_creation_cannot_overwrite_a_newer_update_or_revive_a_cancelled_subscription(): void
    {
        $user = User::factory()->create();
        $plan = PremiumPlan::factory()->create();
        $payload = $this->subscriptionPayload($user, $plan, 'past_due');
        $this->deliver('evt_update_first', 'customer.subscription.updated', $payload, time() + 5)->assertOk();
        $payload['status'] = 'active';
        $this->deliver('evt_creation_late', 'customer.subscription.created', $payload, time())->assertOk();
        $this->assertFalse($user->fresh()->isPremium());
        $this->deliver('evt_delete', 'customer.subscription.deleted', ['id' => 'sub_synthetic', 'status' => 'canceled'], time() + 6)->assertOk();
        $this->deliver('evt_update_after_terminal', 'customer.subscription.updated', $payload, time() + 7)->assertOk();
        $this->assertSame('canceled', Subscription::first()->status);
        $this->assertFalse($user->fresh()->isPremium());
    }

    public function test_cancelling_one_subscription_preserves_another_active_subscription(): void
    {
        $user = User::factory()->create();
        $plan = PremiumPlan::factory()->create();
        $this->deliver('evt_first_sub', 'customer.subscription.created', $this->subscriptionPayload($user, $plan, 'active', 'sub_first'))->assertOk();
        $this->deliver('evt_second_sub', 'customer.subscription.created', $this->subscriptionPayload($user, $plan, 'active', 'sub_second'))->assertOk();
        $this->deliver('evt_first_cancelled', 'customer.subscription.deleted', ['id' => 'sub_first', 'status' => 'canceled'])->assertOk();
        $this->assertTrue($user->fresh()->isPremium());
    }
}
