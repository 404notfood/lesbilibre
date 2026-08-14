<?php

namespace App\Http\Controllers;

use App\Models\StripeEvent;
use App\Models\Subscription;
use App\Models\User;
use App\Services\GemService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;

class StripeWebhookController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
        protected GemService $gemService,
    ) {}

    /**
     * Handle Stripe webhook events.
     */
    public function handle(Request $request): Response
    {
        $payload = $request->getContent();
        $signature = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $signature, $webhookSecret);
        } catch (SignatureVerificationException $e) {
            logger()->error('Stripe webhook signature verification failed', [
                'error' => $e->getMessage(),
            ]);

            return response('Webhook signature verification failed', 400);
        }

        // Log event to database
        $stripeEvent = StripeEvent::findOrCreateFromStripeEvent(
            $event->id,
            $event->type,
            json_decode($payload, true)
        );

        // Check if event has already been processed (idempotency)
        if ($stripeEvent->isProcessed()) {
            logger()->info('Stripe webhook event already processed', [
                'event_id' => $event->id,
                'type' => $event->type,
            ]);

            return response('Webhook already processed', 200);
        }

        // Handle the event
        try {
            match ($event->type) {
                'checkout.session.completed' => $this->handleCheckoutCompleted($event->data->object),
                'customer.subscription.created' => $this->handleSubscriptionCreated($event->data->object),
                'customer.subscription.updated' => $this->handleSubscriptionUpdated($event->data->object),
                'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event->data->object),
                'invoice.payment_succeeded' => $this->handlePaymentSucceeded($event->data->object),
                'invoice.payment_failed' => $this->handlePaymentFailed($event->data->object),
                default => logger()->info('Unhandled Stripe webhook event', ['type' => $event->type]),
            };

            // Mark event as successfully processed
            $stripeEvent->markAsProcessed();
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage();

            logger()->error('Stripe webhook processing failed', [
                'event_id' => $event->id,
                'event_type' => $event->type,
                'error' => $errorMessage,
                'trace' => $e->getTraceAsString(),
            ]);

            // Mark event as failed
            $stripeEvent->markAsFailed($errorMessage);

            return response('Webhook processing failed', 500);
        }

        return response('Webhook handled', 200);
    }

    /**
     * Handle checkout session completed (one-time purchase).
     */
    protected function handleCheckoutCompleted(object $session): void
    {
        $userId = $session->client_reference_id;
        $metadata = $session->metadata;

        if (! $userId) {
            logger()->warning('Checkout session without user ID', ['session_id' => $session->id]);

            return;
        }

        $user = User::find($userId);

        if (! $user) {
            logger()->error('User not found for checkout session', ['user_id' => $userId]);

            return;
        }

        // Handle gems purchase
        if ($metadata->type === 'gems' && isset($metadata->gems)) {
            $gems = (int) $metadata->gems;

            $this->gemService->addGems(
                $user,
                $gems,
                'purchase',
                'stripe_checkout',
                'Achat de gemmes',
                [
                    'stripe_session_id' => $session->id,
                    'stripe_payment_intent' => $session->payment_intent,
                    'amount_paid' => $session->amount_total / 100,
                ]
            );

            logger()->info('Gems credited to user', [
                'user_id' => $user->id,
                'gems' => $gems,
                'session_id' => $session->id,
            ]);
        }

        // Premium subscriptions are activated exclusively from the
        // customer.subscription.* events. A Checkout Session only confirms that
        // Stripe created the subscription; handling it here as well would grant
        // the same benefits twice.
    }

    /**
     * Handle subscription created.
     */
    protected function handleSubscriptionCreated(object $subscription): void
    {
        $userId = $subscription->metadata->user_id ?? null;

        if (! $userId) {
            logger()->warning('Subscription without user ID', ['subscription_id' => $subscription->id]);

            return;
        }

        $user = User::find($userId);

        if (! $user) {
            logger()->error('User not found for subscription', ['user_id' => $userId]);

            return;
        }

        // Create or update subscription record
        Subscription::updateOrCreate(
            ['stripe_subscription_id' => $subscription->id],
            [
                'user_id' => $user->id,
                'stripe_customer_id' => $subscription->customer,
                'stripe_price_id' => $subscription->items->data[0]->price->id,
                'plan' => $subscription->items->data[0]->price->id,
                'amount' => ($subscription->items->data[0]->price->unit_amount ?? 0) / 100,
                'status' => $subscription->status,
                'starts_at' => now()->createFromTimestamp($subscription->current_period_start),
                'expires_at' => now()->createFromTimestamp($subscription->current_period_end),
                'payment_method' => 'stripe',
                'transaction_id' => $subscription->id,
                'current_period_start' => now()->createFromTimestamp($subscription->current_period_start),
                'current_period_end' => now()->createFromTimestamp($subscription->current_period_end),
            ]
        );

        // Activate premium
        $wasPremium = $user->is_premium;
        $user->is_premium = true;
        $user->premium_expires_at = \Carbon\Carbon::createFromTimestamp($subscription->current_period_end);
        $user->save();

        // Trigger badge check if user became premium
        if (! $wasPremium) {
            \App\Events\UserSubscribed::dispatch($user);
        }

        logger()->info('Premium subscription created', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
        ]);
    }

    /**
     * Handle subscription updated.
     */
    protected function handleSubscriptionUpdated(object $subscription): void
    {
        $dbSubscription = Subscription::where('stripe_subscription_id', $subscription->id)->first();

        if (! $dbSubscription) {
            logger()->warning('Subscription not found in database', ['subscription_id' => $subscription->id]);

            return;
        }

        // Update subscription status
        $dbSubscription->update([
            'status' => $subscription->status,
            'starts_at' => now()->createFromTimestamp($subscription->current_period_start),
            'expires_at' => now()->createFromTimestamp($subscription->current_period_end),
            'current_period_start' => now()->createFromTimestamp($subscription->current_period_start),
            'current_period_end' => now()->createFromTimestamp($subscription->current_period_end),
        ]);

        $user = $dbSubscription->user;
        $wasPremium = $user->is_premium;

        // Update user premium status
        if ($subscription->status === 'active') {
            $user->is_premium = true;
            $user->premium_expires_at = \Carbon\Carbon::createFromTimestamp($subscription->current_period_end);
            $user->save();

            // Trigger badge check if user just became premium
            if (! $wasPremium) {
                \App\Events\UserSubscribed::dispatch($user);
            }
        } elseif (in_array($subscription->status, ['canceled', 'unpaid', 'past_due'])) {
            $user->is_premium = false;
            $user->premium_expires_at = null;
            $user->save();
        }

        logger()->info('Subscription updated', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'status' => $subscription->status,
        ]);
    }

    /**
     * Handle subscription deleted (cancelled).
     */
    protected function handleSubscriptionDeleted(object $subscription): void
    {
        $dbSubscription = Subscription::where('stripe_subscription_id', $subscription->id)->first();

        if (! $dbSubscription) {
            logger()->warning('Subscription not found in database', ['subscription_id' => $subscription->id]);

            return;
        }

        $user = $dbSubscription->user;

        // Update subscription status
        $dbSubscription->update(['status' => 'canceled']);

        // Deactivate premium
        $user->is_premium = false;
        $user->premium_expires_at = null;
        $user->save();

        logger()->info('Premium subscription canceled', [
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
        ]);
    }

    /**
     * Handle invoice payment succeeded (recurring payment).
     */
    protected function handlePaymentSucceeded(object $invoice): void
    {
        $subscriptionId = $invoice->subscription;

        if (! $subscriptionId) {
            return; // Not a subscription payment
        }

        $dbSubscription = Subscription::where('stripe_subscription_id', $subscriptionId)->first();

        if (! $dbSubscription) {
            logger()->warning('Subscription not found for invoice', ['subscription_id' => $subscriptionId]);

            return;
        }

        $user = $dbSubscription->user;

        // One successful invoice equals one monthly bonus. Stripe event
        // idempotency prevents a webhook retry from crediting it twice.
        $this->gemService->addGems(
            $user,
            100,
            'earn',
            'premium_monthly_bonus',
            'Bonus mensuel Premium',
            ['stripe_invoice_id' => $invoice->id, 'stripe_subscription_id' => $subscriptionId]
        );

        logger()->info('Recurring payment succeeded, bonus gems added', [
            'user_id' => $user->id,
            'invoice_id' => $invoice->id,
        ]);
    }

    /**
     * Handle invoice payment failed.
     */
    protected function handlePaymentFailed(object $invoice): void
    {
        $subscriptionId = $invoice->subscription;

        if (! $subscriptionId) {
            return;
        }

        $dbSubscription = Subscription::where('stripe_subscription_id', $subscriptionId)->first();

        if (! $dbSubscription) {
            return;
        }

        $user = $dbSubscription->user;

        // Notify user about failed payment
        $this->notificationService->notifyGift(
            $user->id,
            0,
            'Votre paiement Premium a échoué. Veuillez mettre à jour vos informations de paiement.'
        );

        logger()->warning('Premium payment failed', [
            'user_id' => $user->id,
            'invoice_id' => $invoice->id,
        ]);
    }

    /**
     * Activate Premium for a user.
     */
    protected function activatePremium(User $user, object $session): void
    {
        // Determine duration based on price (would need to be in metadata in real implementation)
        $duration = 1; // Default 1 month

        $wasPremium = $user->is_premium;
        $user->is_premium = true;
        $user->premium_expires_at = now()->addMonths($duration);
        $user->save();

        // Give bonus gems
        $user->increment('gems', 100);

        // Create subscription record
        Subscription::create([
            'user_id' => $user->id,
            'stripe_subscription_id' => $session->subscription ?? null,
            'stripe_customer_id' => $session->customer,
            'stripe_price_id' => null,
            'status' => 'active',
            'current_period_start' => now(),
            'current_period_end' => now()->addMonths($duration),
        ]);

        // Trigger badge check if user just became premium
        if (! $wasPremium) {
            \App\Events\UserSubscribed::dispatch($user);
        }

        logger()->info('Premium activated via checkout', [
            'user_id' => $user->id,
            'session_id' => $session->id,
        ]);
    }
}
