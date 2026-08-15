<?php

namespace App\Http\Controllers;

use App\Models\PremiumPlan;
use App\Models\Subscription;
use App\Services\StripePaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PremiumController extends Controller
{
    public function __construct(
        protected StripePaymentService $stripeService
    ) {}

    /**
     * Display the premium subscription page.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        // Premium features
        $features = [
            [
                'icon' => '👁️',
                'title' => 'Voir qui te like',
                'description' => 'Découvre qui a liké ton profil avant de matcher',
            ],
            [
                'icon' => '❤️',
                'title' => 'Likes illimités',
                'description' => 'Like autant de profils que tu veux sans limite',
            ],
            [
                'icon' => '🚀',
                'title' => 'Boost ton profil',
                'description' => 'Apparais en première position pendant 30 minutes',
            ],
            [
                'icon' => '🔍',
                'title' => 'Filtres avancés',
                'description' => 'Affine ta recherche avec des critères exclusifs',
            ],
            [
                'icon' => '⏮️',
                'title' => 'Retour en arrière',
                'description' => 'Reviens sur un profil que tu as passé par erreur',
            ],
            [
                'icon' => '🎯',
                'title' => 'Super Like',
                'description' => '5 Super Likes par jour pour te démarquer',
            ],
            [
                'icon' => '🔒',
                'title' => 'Mode privé',
                'description' => 'Contrôle qui peut voir ton profil',
            ],
            [
                'icon' => '💬',
                'title' => 'Messages prioritaires',
                'description' => 'Tes messages apparaissent en premier',
            ],
        ];

        // Premium plans — managed from the admin console (premium_plans table)
        $offered = PremiumPlan::offered()->get();
        $reference = (float) ($offered->sortBy('duration_months')->first()?->pricePerMonth() ?? 0);

        $plans = $offered->map(fn (PremiumPlan $plan) => [
            'id' => $plan->id,
            'duration' => $plan->name,
            'tagline' => $plan->tagline,
            'price' => (float) $plan->price,
            'pricePerMonth' => $plan->pricePerMonth(),
            'savings' => $plan->savingsPercent($reference),
            'popular' => $plan->is_featured,
            'perks' => $plan->perks ?? [],
            'available' => $plan->isPurchasable(),
        ])->values();

        // Social proof
        $testimonials = [
            [
                'name' => 'Sophie',
                'rating' => 5,
                'comment' => 'Grâce au premium, j\'ai trouvé l\'amour en 2 semaines ! 💕',
            ],
            [
                'name' => 'Marie',
                'rating' => 5,
                'comment' => 'Les filtres avancés m\'ont fait gagner beaucoup de temps',
            ],
            [
                'name' => 'Claire',
                'rating' => 5,
                'comment' => 'Le boost de profil est incroyable, j\'ai eu 10x plus de matches !',
            ],
        ];

        // User's current subscription status
        $currentSubscription = $user->subscriptions()
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        return Inertia::render('Premium/Index', [
            'features' => $features,
            'plans' => $plans,
            'testimonials' => $testimonials,
            'currentSubscription' => $currentSubscription ? [
                'id' => $currentSubscription->id,
                'plan' => $currentSubscription->plan,
                'amount' => (float) $currentSubscription->amount,
                'status' => $currentSubscription->status,
                'expires_at' => $currentSubscription->expires_at?->toISOString(),
                // Un abonnement Stripe se résilie depuis le portail de facturation ;
                // les autres (créés depuis la console) n'ont que la résiliation interne.
                'managed_by_stripe' => filled($currentSubscription->stripe_customer_id),
            ] : null,
            'isPremium' => $user->isPremium(),
        ]);
    }

    public function subscribe(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => ['required', 'integer', 'exists:premium_plans,id'],
        ]);

        $user = $request->user();

        $plan = PremiumPlan::find($validated['plan_id']);

        if (! $plan || ! $plan->is_active) {
            return back()->with('error', 'Ce plan n’est plus disponible.');
        }

        // Create Stripe Checkout session for subscription
        if (! $plan->isPurchasable()) {
            logger()->error('Stripe price ID missing for Premium plan', [
                'plan_id' => $plan->id,
                'slug' => $plan->slug,
            ]);

            return back()->with('error', 'Le paiement Premium est temporairement indisponible.');
        }

        $checkoutUrl = $this->stripeService->createPremiumSubscription(
            priceId: $plan->stripe_price_id,
            userId: $user->id
        );

        if (! $checkoutUrl) {
            return back()->with('error', 'Erreur lors de la création de la session de paiement. Veuillez réessayer.');
        }

        // Redirect to Stripe Checkout
        return redirect()->away($checkoutUrl);
    }

    /**
     * Handle successful subscription checkout.
     */
    public function checkoutSuccess(Request $request): RedirectResponse
    {
        $sessionId = $request->query('session_id');

        if (! $sessionId) {
            return redirect()->route('premium.index')->with('error', 'Session invalide.');
        }

        // Verify session with Stripe
        $session = $this->stripeService->getSession($sessionId);

        if (! $session || $session->payment_status !== 'paid') {
            return redirect()->route('premium.index')->with('error', 'Paiement non confirmé.');
        }

        return redirect()->route('premium.index')->with('success', 'Bienvenue dans le club Premium ! 🎉 Votre abonnement sera activé dans quelques instants.');
    }

    /**
     * Handle cancelled checkout.
     */
    public function checkoutCancel(): RedirectResponse
    {
        return redirect()->route('premium.index')->with('info', 'Abonnement annulé.');
    }

    /** Redirect an active subscriber to the Stripe self-service billing portal. */
    public function billingPortal(Request $request): RedirectResponse
    {
        $subscription = $request->user()->subscriptions()
            ->whereNotNull('stripe_customer_id')->latest()->first();

        if (! $subscription?->stripe_customer_id) {
            return back()->with('error', 'Aucun abonnement Stripe ne peut être géré pour ce compte.');
        }

        $url = $this->stripeService->createBillingPortalSession(
            $subscription->stripe_customer_id,
            route('premium.index')
        );

        return $url ? redirect()->away($url) : back()->with('error', 'Le portail de paiement est temporairement indisponible.');
    }

    /**
     * Let a member end her own subscription without going through support.
     *
     * The subscription is marked cancelled but the premium access is kept until
     * the date already paid for — resigning should not take away what has been
     * bought. Stripe-backed subscriptions still need the billing portal so the
     * recurring charge itself stops, which is why they are refused here.
     */
    public function cancel(Request $request): RedirectResponse
    {
        $user = $request->user();

        $subscription = $user->subscriptions()
            ->where('status', 'active')
            ->latest()
            ->first();

        if (! $subscription) {
            return back()->with('error', 'Aucun abonnement actif à résilier.');
        }

        if (filled($subscription->stripe_customer_id)) {
            return back()->with(
                'error',
                'Cet abonnement est géré par notre prestataire de paiement. Utilise « Gérer mon abonnement » pour le résilier et arrêter le prélèvement.'
            );
        }

        $subscription->update(['status' => 'canceled']);

        // L'accès reste ouvert jusqu'à l'échéance déjà réglée. Sans échéance,
        // il s'agit d'un accès offert : il prend fin immédiatement.
        $keepUntil = $subscription->expires_at;

        if ($keepUntil?->isFuture()) {
            $user->premium_expires_at = $keepUntil;
        } else {
            $user->is_premium = false;
            $user->premium_expires_at = null;
        }

        $user->save();

        return back()->with(
            'success',
            $keepUntil?->isFuture()
                ? 'Abonnement résilié. Tu gardes ton accès Premium jusqu’au '.$keepUntil->format('d/m/Y').'.'
                : 'Abonnement résilié.'
        );
    }
}
