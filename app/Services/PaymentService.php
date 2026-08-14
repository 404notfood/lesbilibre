<?php

namespace App\Services;

use App\Models\Subscription;
use App\Models\User;
use Stripe\StripeClient;

class PaymentService
{
    protected StripeClient $stripe;

    public function __construct()
    {
        // Initialize Stripe with secret key from config
        $this->stripe = new StripeClient(config('services.stripe.secret'));
    }

    /**
     * Create a payment intent for gems purchase.
     */
    public function createGemsPaymentIntent(User $user, int $packageId): array
    {
        $packages = [
            1 => ['amount' => 100, 'price' => 4.99, 'bonus' => 0],
            2 => ['amount' => 250, 'price' => 9.99, 'bonus' => 25],
            3 => ['amount' => 500, 'price' => 19.99, 'bonus' => 75],
            4 => ['amount' => 1000, 'price' => 34.99, 'bonus' => 200],
            5 => ['amount' => 2500, 'price' => 79.99, 'bonus' => 600],
        ];

        $package = $packages[$packageId] ?? null;

        if (! $package) {
            throw new \Exception('Package invalide');
        }

        // Create Stripe payment intent
        $paymentIntent = $this->stripe->paymentIntents->create([
            'amount' => $package['price'] * 100, // Convert to cents
            'currency' => 'eur',
            'metadata' => [
                'user_id' => $user->id,
                'package_id' => $packageId,
                'gems_amount' => $package['amount'],
                'gems_bonus' => $package['bonus'],
                'type' => 'gems_purchase',
            ],
        ]);

        return [
            'client_secret' => $paymentIntent->client_secret,
            'payment_intent_id' => $paymentIntent->id,
            'package' => $package,
        ];
    }

    /**
     * Create a payment intent for premium subscription.
     */
    public function createPremiumPaymentIntent(User $user, int $planId): array
    {
        $plans = [
            1 => ['duration' => '1_month', 'months' => 1, 'price' => 19.99],
            2 => ['duration' => '3_months', 'months' => 3, 'price' => 44.99],
            3 => ['duration' => '6_months', 'months' => 6, 'price' => 69.99],
        ];

        $plan = $plans[$planId] ?? null;

        if (! $plan) {
            throw new \Exception('Plan invalide');
        }

        // Create Stripe payment intent
        $paymentIntent = $this->stripe->paymentIntents->create([
            'amount' => $plan['price'] * 100, // Convert to cents
            'currency' => 'eur',
            'metadata' => [
                'user_id' => $user->id,
                'plan_id' => $planId,
                'plan_duration' => $plan['duration'],
                'months' => $plan['months'],
                'type' => 'premium_subscription',
            ],
        ]);

        return [
            'client_secret' => $paymentIntent->client_secret,
            'payment_intent_id' => $paymentIntent->id,
            'plan' => $plan,
        ];
    }

    /**
     * Handle successful gems payment.
     */
    public function handleGemsPaymentSuccess(string $paymentIntentId): void
    {
        $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

        if ($paymentIntent->status !== 'succeeded') {
            throw new \Exception('Payment non confirmé');
        }

        $metadata = $paymentIntent->metadata;
        $user = User::findOrFail($metadata['user_id']);

        $totalGems = $metadata['gems_amount'] + $metadata['gems_bonus'];

        app(GemService::class)->addGems(
            $user,
            $totalGems,
            'earn',
            'purchase',
            "Achat de {$metadata['gems_amount']} gemmes (+{$metadata['gems_bonus']} bonus)",
            [
                'package_id' => $metadata['package_id'],
                'price' => $paymentIntent->amount / 100,
                'payment_method' => 'stripe',
                'payment_intent_id' => $paymentIntentId,
            ]
        );
    }

    /**
     * Handle successful premium payment.
     */
    public function handlePremiumPaymentSuccess(string $paymentIntentId): void
    {
        $paymentIntent = $this->stripe->paymentIntents->retrieve($paymentIntentId);

        if ($paymentIntent->status !== 'succeeded') {
            throw new \Exception('Payment non confirmé');
        }

        $metadata = $paymentIntent->metadata;
        $user = User::findOrFail($metadata['user_id']);

        $startsAt = now();
        $expiresAt = now()->addMonths($metadata['months']);

        // Create subscription record
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'plan' => $metadata['plan_duration'],
            'amount' => $paymentIntent->amount / 100,
            'status' => 'active',
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
            'payment_method' => 'stripe',
            'transaction_id' => $paymentIntentId,
        ]);

        // Update user premium status
        $user->is_premium = true;
        $user->premium_expires_at = $expiresAt;
        $user->save();

        // Give welcome bonus gems
        app(GemService::class)->addGems(
            $user,
            100,
            'earn',
            'premium_bonus',
            'Bonus de bienvenue Premium',
            ['subscription_id' => $subscription->id]
        );
    }

    /**
     * Create webhook signature verification.
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        try {
            \Stripe\Webhook::constructEvent(
                $payload,
                $signature,
                config('services.stripe.webhook_secret')
            );

            return true;
        } catch (\Exception $e) {
            return false;
        }
    }
}
