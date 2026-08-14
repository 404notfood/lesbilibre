<?php

namespace Tests\Feature;

use App\Models\StripeEvent;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Stripe\Event;
use Stripe\Webhook;
use Tests\TestCase;

class StripeWebhookTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Set webhook secret for testing
        Config::set('services.stripe.webhook_secret', 'whsec_test_secret');
    }

    /**
     * Generate a valid Stripe webhook signature for testing.
     */
    protected function generateStripeSignature(string $payload, string $secret): string
    {
        $timestamp = time();
        $signedPayload = $timestamp.'.'.$payload;
        $signature = hash_hmac('sha256', $signedPayload, $secret);

        return "t={$timestamp},v1={$signature}";
    }

    /**
     * Create a mock Stripe event payload.
     */
    protected function createEventPayload(string $type, array $data): array
    {
        return [
            'id' => 'evt_'.uniqid(),
            'type' => $type,
            'data' => [
                'object' => $data,
            ],
            'created' => time(),
        ];
    }

    public function test_rejects_invalid_signature(): void
    {
        $payload = json_encode($this->createEventPayload('test.event', []));

        $response = $this->postJson(
            route('webhook.stripe'),
            json_decode($payload, true),
            ['Stripe-Signature' => 'invalid_signature']
        );

        $response->assertStatus(400);
    }

    public function test_logs_event_to_database(): void
    {
        $eventData = $this->createEventPayload('test.event', ['test' => 'data']);
        $payload = json_encode($eventData);
        $signature = $this->generateStripeSignature($payload, 'whsec_test_secret');

        // Mock Stripe Webhook verification
        Webhook::shouldReceive('constructEvent')
            ->once()
            ->andReturn(Event::constructFrom($eventData));

        $this->postJson(
            route('webhook.stripe'),
            json_decode($payload, true),
            ['Stripe-Signature' => $signature]
        );

        $this->assertDatabaseHas('stripe_events', [
            'stripe_event_id' => $eventData['id'],
            'type' => 'test.event',
            'processed' => true,
        ]);
    }

    public function test_handles_duplicate_events_idempotently(): void
    {
        $user = User::factory()->create();

        $eventData = $this->createEventPayload('checkout.session.completed', [
            'id' => 'cs_test_123',
            'client_reference_id' => $user->id,
            'customer' => 'cus_test',
            'amount_total' => 1000,
            'payment_intent' => 'pi_test',
            'metadata' => [
                'type' => 'gems',
                'gems' => 100,
            ],
        ]);

        $payload = json_encode($eventData);
        $signature = $this->generateStripeSignature($payload, 'whsec_test_secret');

        // Mock Stripe Webhook verification
        Webhook::shouldReceive('constructEvent')
            ->twice()
            ->andReturn(Event::constructFrom($eventData));

        // First webhook
        $this->postJson(
            route('webhook.stripe'),
            json_decode($payload, true),
            ['Stripe-Signature' => $signature]
        )->assertStatus(200);

        $initialGemBalance = $user->fresh()->gems;

        // Duplicate webhook (should be ignored)
        $this->postJson(
            route('webhook.stripe'),
            json_decode($payload, true),
            ['Stripe-Signature' => $signature]
        )->assertStatus(200);

        // Gems should not be added twice
        $this->assertEquals($initialGemBalance, $user->fresh()->gems);

        // Only one event record should exist
        $this->assertCount(1, StripeEvent::where('stripe_event_id', $eventData['id'])->get());
    }

    public function test_handles_checkout_session_completed_gems_purchase(): void
    {
        $user = User::factory()->create(['gems' => 50]);

        $eventData = $this->createEventPayload('checkout.session.completed', [
            'id' => 'cs_test_123',
            'client_reference_id' => $user->id,
            'customer' => 'cus_test',
            'amount_total' => 1000, // €10.00
            'payment_intent' => 'pi_test',
            'metadata' => [
                'type' => 'gems',
                'gems' => 100,
            ],
        ]);

        $payload = json_encode($eventData);
        $signature = $this->generateStripeSignature($payload, 'whsec_test_secret');

        Webhook::shouldReceive('constructEvent')
            ->once()
            ->andReturn(Event::constructFrom($eventData));

        $this->postJson(
            route('webhook.stripe'),
            json_decode($payload, true),
            ['Stripe-Signature' => $signature]
        )->assertStatus(200);

        // Check gems added
        $this->assertEquals(150, $user->fresh()->gems);

        // Check transaction recorded
        $this->assertDatabaseHas('gem_transactions', [
            'user_id' => $user->id,
            'type' => 'purchase',
            'amount' => 100,
            'reason' => 'stripe_checkout',
        ]);
    }

    public function test_handles_subscription_created(): void
    {
        $user = User::factory()->create([
            'is_premium' => false,
            'gems' => 0,
        ]);

        $currentPeriodStart = time();
        $currentPeriodEnd = strtotime('+1 month', $currentPeriodStart);

        $eventData = $this->createEventPayload('customer.subscription.created', [
            'id' => 'sub_test_123',
            'customer' => 'cus_test',
            'status' => 'active',
            'current_period_start' => $currentPeriodStart,
            'current_period_end' => $currentPeriodEnd,
            'items' => [
                'data' => [
                    ['price' => ['id' => 'price_premium_monthly']],
                ],
            ],
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        $payload = json_encode($eventData);
        $signature = $this->generateStripeSignature($payload, 'whsec_test_secret');

        Webhook::shouldReceive('constructEvent')
            ->once()
            ->andReturn(Event::constructFrom($eventData));

        $this->postJson(
            route('webhook.stripe'),
            json_decode($payload, true),
            ['Stripe-Signature' => $signature]
        )->assertStatus(200);

        // Check user premium status
        $user->refresh();
        $this->assertTrue($user->is_premium);
        $this->assertNotNull($user->premium_expires_at);
        $this->assertEquals(0, $user->gems); // Credited only by a paid invoice

        // Check subscription record
        $this->assertDatabaseHas('subscriptions', [
            'user_id' => $user->id,
            'stripe_subscription_id' => 'sub_test_123',
            'status' => 'active',
        ]);
    }

    public function test_handles_subscription_deleted(): void
    {
        $user = User::factory()->create([
            'is_premium' => true,
            'premium_expires_at' => now()->addMonth(),
        ]);

        $subscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'stripe_subscription_id' => 'sub_test_123',
            'status' => 'active',
        ]);

        $eventData = $this->createEventPayload('customer.subscription.deleted', [
            'id' => 'sub_test_123',
            'status' => 'canceled',
        ]);

        $payload = json_encode($eventData);
        $signature = $this->generateStripeSignature($payload, 'whsec_test_secret');

        Webhook::shouldReceive('constructEvent')
            ->once()
            ->andReturn(Event::constructFrom($eventData));

        $this->postJson(
            route('webhook.stripe'),
            json_decode($payload, true),
            ['Stripe-Signature' => $signature]
        )->assertStatus(200);

        // Check premium deactivated
        $user->refresh();
        $this->assertFalse($user->is_premium);
        $this->assertNull($user->premium_expires_at);

        // Check subscription canceled
        $this->assertDatabaseHas('subscriptions', [
            'id' => $subscription->id,
            'status' => 'canceled',
        ]);
    }

    public function test_handles_invoice_payment_succeeded(): void
    {
        $user = User::factory()->create(['gems' => 50]);

        $subscription = Subscription::factory()->create([
            'user_id' => $user->id,
            'stripe_subscription_id' => 'sub_test_123',
            'status' => 'active',
        ]);

        $eventData = $this->createEventPayload('invoice.payment_succeeded', [
            'id' => 'in_test_123',
            'subscription' => 'sub_test_123',
        ]);

        $payload = json_encode($eventData);
        $signature = $this->generateStripeSignature($payload, 'whsec_test_secret');

        Webhook::shouldReceive('constructEvent')
            ->once()
            ->andReturn(Event::constructFrom($eventData));

        $this->postJson(
            route('webhook.stripe'),
            json_decode($payload, true),
            ['Stripe-Signature' => $signature]
        )->assertStatus(200);

        // Check bonus gems added
        $this->assertEquals(150, $user->fresh()->gems);
    }

    public function test_marks_failed_events_with_error(): void
    {
        // Create event that will fail (non-existent user)
        $eventData = $this->createEventPayload('checkout.session.completed', [
            'id' => 'cs_test_fail',
            'client_reference_id' => 99999, // Non-existent user
            'customer' => 'cus_test',
            'amount_total' => 1000,
            'payment_intent' => 'pi_test',
            'metadata' => [
                'type' => 'gems',
                'gems' => 100,
            ],
        ]);

        $payload = json_encode($eventData);
        $signature = $this->generateStripeSignature($payload, 'whsec_test_secret');

        Webhook::shouldReceive('constructEvent')
            ->once()
            ->andReturn(Event::constructFrom($eventData));

        $this->postJson(
            route('webhook.stripe'),
            json_decode($payload, true),
            ['Stripe-Signature' => $signature]
        )->assertStatus(500);

        // Check event marked as failed
        $stripeEvent = StripeEvent::where('stripe_event_id', $eventData['id'])->first();
        $this->assertNotNull($stripeEvent);
        $this->assertFalse($stripeEvent->processed);
        $this->assertNotNull($stripeEvent->error);
    }
}
