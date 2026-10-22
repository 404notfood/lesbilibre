<?php

namespace App\Http\Controllers;

use App\Models\GemTransaction;
use App\Models\PremiumPlan;
use App\Models\StripeEvent;
use App\Models\Subscription;
use App\Models\User;
use App\Services\GemService;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Webhook;
use Throwable;
use UnexpectedValueException;

class StripeWebhookController extends Controller
{
    private int $eventCreated = 0;

    private string $eventType = '';

    public function __construct(
        protected NotificationService $notificationService,
        protected GemService $gemService,
    ) {}

    public function handle(Request $request): Response
    {
        $secret = config('services.stripe.webhook_secret');
        if (! is_string($secret) || $secret === '') {
            return response('Webhook unavailable', 503);
        }
        try {
            $event = Webhook::constructEvent($request->getContent(), (string) $request->header('Stripe-Signature'), $secret);
        } catch (SignatureVerificationException|UnexpectedValueException $exception) {
            return response('Invalid webhook', 400);
        }

        $this->eventCreated = (int) ($event->created ?? 0);
        $this->eventType = (string) $event->type;
        $stored = StripeEvent::findOrCreateFromStripeEvent($event->id, $event->type, json_decode($request->getContent(), true, 512, JSON_THROW_ON_ERROR));

        try {
            // The event marker and all database effects commit together. An
            // exception rolls them all back so a Stripe retry can safely run.
            $processed = DB::transaction(function () use ($stored, $event) {
                $locked = StripeEvent::whereKey($stored->id)->lockForUpdate()->firstOrFail();
                if ($locked->isProcessed()) {
                    return false;
                }
                match ($event->type) {
                    'checkout.session.completed', 'checkout.session.async_payment_succeeded' => $this->handleCheckoutCompleted($event->data->object),
                    'customer.subscription.created' => $this->handleSubscriptionCreated($event->data->object),
                    'customer.subscription.updated' => $this->handleSubscriptionUpdated($event->data->object),
                    'customer.subscription.deleted' => $this->handleSubscriptionDeleted($event->data->object),
                    'invoice.payment_succeeded' => $this->handlePaymentSucceeded($event->data->object),
                    'invoice.payment_failed' => $this->handlePaymentFailed($event->data->object),
                    default => null,
                };
                $locked->markAsProcessed();

                return true;
            }, attempts: 3);
        } catch (Throwable $exception) {
            // A concurrent successful attempt must not be changed back to failed.
            StripeEvent::whereKey($stored->id)->where('processed', false)->update(['error' => $exception::class]);
            logger()->error('Stripe webhook processing failed', ['event_id' => $event->id, 'event_type' => $event->type, 'exception' => $exception::class]);

            return response('Webhook processing failed', 500);
        }

        return response($processed ? 'Webhook handled' : 'Webhook already processed', 200);
    }

    protected function handleCheckoutCompleted(object $session): void
    {
        if (($session->metadata->type ?? null) !== 'gems' || ($session->payment_status ?? null) !== 'paid') {
            return;
        }
        $user = User::whereKey($session->client_reference_id ?? null)->lockForUpdate()->first();
        if (! $user) {
            return; // Deleted accounts must never be recreated from a payment.
        }
        $sessionId = (string) ($session->id ?? '');
        $gems = (int) ($session->metadata->gems ?? 0);
        if ($sessionId === '' || $gems <= 0) {
            throw new RuntimeException('Incomplete gem checkout.');
        }
        // Stripe may deliver distinct event IDs for the same Checkout Session.
        if (GemTransaction::where('user_id', $user->id)->where('reason', 'stripe_checkout')->where('metadata->stripe_session_id', $sessionId)->exists()) {
            return;
        }
        $this->gemService->addGems($user, $gems, 'purchase', 'stripe_checkout', 'Achat de gemmes', [
            'stripe_session_id' => $sessionId,
            'stripe_payment_intent' => $session->payment_intent ?? null,
            'amount_paid' => ((int) ($session->amount_total ?? 0)) / 100,
        ]);
    }

    protected function handleSubscriptionCreated(object $subscription): void
    {
        $this->syncSubscription($subscription);
    }

    protected function handleSubscriptionUpdated(object $subscription): void
    {
        // An update can legitimately arrive before its creation event. Both
        // carry the metadata and are sufficient to materialize the same row.
        $this->syncSubscription($subscription);
    }

    private function syncSubscription(object $subscription): void
    {
        $subscriptionId = (string) ($subscription->id ?? '');
        if ($subscriptionId === '') {
            throw new RuntimeException('Missing subscription identifier.');
        }
        $existing = Subscription::where('stripe_subscription_id', $subscriptionId)->first();
        $userId = $existing?->user_id ?? ($subscription->metadata->user_id ?? null);
        if (! $userId) {
            throw new RuntimeException('Subscription owner is not available yet.');
        }
        // Serialize business effects for distinct Stripe events concerning the
        // same account, including first-time subscription creation.
        $user = User::whereKey($userId)->lockForUpdate()->first();
        if (! $user) {
            return;
        }
        $local = Subscription::where('stripe_subscription_id', $subscriptionId)->lockForUpdate()->first();
        if ($local && $this->isStaleSubscriptionEvent($local)) {
            return;
        }
        $price = $subscription->items->data[0]->price ?? null;
        $priceId = is_string($price) ? $price : ($price->id ?? null);
        $plan = $this->cataloguePlan($priceId);
        $item = $subscription->items->data[0] ?? null;
        $start = (int) ($subscription->current_period_start ?? $item?->current_period_start ?? 0);
        $end = (int) ($subscription->current_period_end ?? $item?->current_period_end ?? 0);
        if ($start <= 0 || $end <= $start) {
            throw new RuntimeException('Subscription period is not available yet.');
        }
        $local ??= new Subscription(['stripe_subscription_id' => $subscriptionId]);
        $local->fill([
            'user_id' => $user->id,
            'stripe_customer_id' => is_string($subscription->customer ?? null) ? $subscription->customer : ($subscription->customer->id ?? null),
            'stripe_price_id' => $priceId,
            'plan' => $plan->slug,
            'amount' => isset($price->unit_amount) ? $price->unit_amount / 100 : (float) $plan->price,
            'status' => (string) ($subscription->status ?? 'incomplete'),
            'starts_at' => Carbon::createFromTimestamp($start),
            'expires_at' => Carbon::createFromTimestamp($end),
            'payment_method' => 'stripe',
            'transaction_id' => $subscriptionId,
            'current_period_start' => Carbon::createFromTimestamp($start),
            'current_period_end' => Carbon::createFromTimestamp($end),
        ]);
        $local->forceFill(['stripe_event_created_at' => $this->eventCreated, 'stripe_event_type' => $this->eventType])->save();
        $this->syncUserPremium($user);
    }

    private function cataloguePlan(?string $priceId): PremiumPlan
    {
        $plans = PremiumPlan::where('stripe_price_id', $priceId)->whereNotNull('stripe_price_id')->limit(2)->get();
        if ($plans->count() !== 1) {
            // Leave this event retryable until the catalogue is reconciled.
            throw new RuntimeException('Stripe price is missing or ambiguous in the catalogue.');
        }

        return $plans->first();
    }

    private function isStaleSubscriptionEvent(Subscription $local): bool
    {
        // A canceled Stripe subscription cannot be resumed with the same ID.
        if (in_array($local->status, ['canceled', 'cancelled'], true)) {
            return true;
        }
        $previous = (int) $local->getAttribute('stripe_event_created_at');
        if ($previous > $this->eventCreated) {
            return true;
        }

        // Stripe timestamps are second-granular; do not let creation overwrite
        // an update from that same second.
        return $previous === $this->eventCreated && $this->eventType === 'customer.subscription.created'
            && $local->getAttribute('stripe_event_type') === 'customer.subscription.updated';
    }

    private function syncUserPremium(User $user): void
    {
        $current = $user->subscriptions()->where('status', 'active')->where('expires_at', '>', now())->orderByDesc('expires_at')->first();
        $wasPremium = $user->isPremium();
        $user->forceFill(['is_premium' => $current !== null, 'premium_expires_at' => $current?->expires_at])->save();
        if ($current && ! $wasPremium) {
            // Badge writes are transactional. A listener exception cannot leave
            // a half-applied activation with an unprocessed event.
            \App\Events\UserSubscribed::dispatch($user);
        }
    }

    protected function handleSubscriptionDeleted(object $subscription): void
    {
        $local = Subscription::where('stripe_subscription_id', $subscription->id)->first();
        if (! $local) {
            // Retry instead of permanently losing a deletion delivered before
            // the corresponding creation/update can be materialized.
            throw new RuntimeException('Subscription deletion arrived before its local record.');
        }
        $user = User::whereKey($local->user_id)->lockForUpdate()->first();
        if (! $user) {
            return;
        }
        $local = Subscription::whereKey($local->id)->lockForUpdate()->firstOrFail();
        if ((int) $local->getAttribute('stripe_event_created_at') > $this->eventCreated) {
            return;
        }
        $local->forceFill(['status' => 'canceled', 'stripe_event_created_at' => $this->eventCreated, 'stripe_event_type' => $this->eventType])->save();
        $this->syncUserPremium($user);
    }

    private function subscriptionForInvoice(object $invoice): ?Subscription
    {
        $id = $invoice->subscription ?? $invoice->parent?->subscription_details?->subscription ?? null;
        if (! $id) {
            return null;
        }
        $local = Subscription::where('stripe_subscription_id', is_string($id) ? $id : $id->id)->first();
        if (! $local) {
            throw new RuntimeException('Invoice arrived before its subscription.');
        }

        return $local;
    }

    protected function handlePaymentSucceeded(object $invoice): void
    {
        $local = $this->subscriptionForInvoice($invoice);
        if (! $local) {
            return;
        }
        $user = User::whereKey($local->user_id)->lockForUpdate()->first();
        if (! $user) {
            return;
        }
        $invoiceId = (string) ($invoice->id ?? '');
        if ($invoiceId === '') {
            throw new RuntimeException('Missing invoice identifier.');
        }
        if (GemTransaction::where('user_id', $user->id)->where('reason', 'premium_monthly_bonus')->where('metadata->stripe_invoice_id', $invoiceId)->exists()) {
            return;
        }
        $plan = $this->cataloguePlan($local->stripe_price_id);
        $bonus = max(0, (int) $plan->gems_per_month);
        if ($bonus > 0) {
            $this->gemService->addGems($user, $bonus, 'earn', 'premium_monthly_bonus', 'Bonus Premium de la période payée', [
                'stripe_invoice_id' => $invoiceId, 'stripe_subscription_id' => $local->stripe_subscription_id,
            ]);
        }
    }

    protected function handlePaymentFailed(object $invoice): void
    {
        $local = $this->subscriptionForInvoice($invoice);
        if ($local && $local->user) {
            $this->notificationService->notifyGift($local->user_id, 0, 'Votre paiement Premium a échoué. Vérifiez votre moyen de paiement depuis votre abonnement.');
        }
    }
}
