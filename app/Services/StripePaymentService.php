<?php

namespace App\Services;

use Stripe\BillingPortal\Session as BillingPortalSession;
use Stripe\Checkout\Session;
use Stripe\Exception\ApiErrorException;
use Stripe\Stripe;

class StripePaymentService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a checkout session for gem purchase.
     */
    public function createGemCheckoutSession(int $amount, int $gems, int $userId): ?string
    {
        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'eur',
                        'product_data' => [
                            'name' => "Pack de {$gems} gemmes",
                            'description' => 'Gemmes pour votre compte Lesbi-Libre',
                        ],
                        'unit_amount' => $amount, // Already in cents from controller
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => route('shop.checkout.success').'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('shop.checkout.cancel'),
                'client_reference_id' => $userId,
                'metadata' => [
                    'type' => 'gems',
                    'gems' => $gems,
                    'user_id' => $userId,
                ],
            ]);

            return $session->url;
        } catch (ApiErrorException $e) {
            logger()->error('Stripe checkout session creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);

            return null;
        }
    }

    /**
     * Create a subscription for premium membership.
     */
    public function createPremiumSubscription(string $priceId, int $userId): ?string
    {
        try {
            $session = Session::create([
                'payment_method_types' => ['card'],
                'line_items' => [[
                    'price' => $priceId,
                    'quantity' => 1,
                ]],
                'mode' => 'subscription',
                'success_url' => route('premium.checkout.success').'?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url' => route('premium.checkout.cancel'),
                'client_reference_id' => $userId,
                'metadata' => [
                    'type' => 'premium',
                    'user_id' => $userId,
                ],
                // Checkout Session metadata is not automatically copied to the
                // Subscription. The webhook handling the subscription needs this
                // immutable link to find the account to activate.
                'subscription_data' => [
                    'metadata' => [
                        'user_id' => (string) $userId,
                    ],
                ],
            ]);

            return $session->url;
        } catch (ApiErrorException $e) {
            logger()->error('Stripe subscription session creation failed', [
                'error' => $e->getMessage(),
                'user_id' => $userId,
            ]);

            return null;
        }
    }

    /**
     * Verify webhook signature.
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

    /**
     * Get session details.
     */
    public function getSession(string $sessionId): ?Session
    {
        try {
            return Session::retrieve($sessionId);
        } catch (ApiErrorException $e) {
            logger()->error('Failed to retrieve Stripe session', [
                'error' => $e->getMessage(),
                'session_id' => $sessionId,
            ]);

            return null;
        }
    }

    /** Create a Stripe-hosted portal for invoices, payment method and cancellation. */
    public function createBillingPortalSession(string $customerId, string $returnUrl): ?string
    {
        try {
            return BillingPortalSession::create([
                'customer' => $customerId,
                'return_url' => $returnUrl,
            ])->url;
        } catch (ApiErrorException $e) {
            logger()->error('Stripe billing portal creation failed', ['error' => $e->getMessage(), 'customer_id' => $customerId]);

            return null;
        }
    }
}
