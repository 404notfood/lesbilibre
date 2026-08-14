<?php

namespace App\Http\Controllers;

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

        // Premium plans
        $plans = [
            [
                'id' => 1,
                'duration' => '1 mois',
                'price' => 19.99,
                'pricePerMonth' => 19.99,
                'savings' => 0,
                'popular' => false,
            ],
            [
                'id' => 2,
                'duration' => '3 mois',
                'price' => 44.99,
                'pricePerMonth' => 14.99,
                'savings' => 25,
                'popular' => true,
            ],
            [
                'id' => 3,
                'duration' => '6 mois',
                'price' => 69.99,
                'pricePerMonth' => 11.66,
                'savings' => 42,
                'popular' => false,
            ],
        ];

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
            'currentSubscription' => $currentSubscription,
            'isPremium' => $user->isPremium(),
        ]);
    }

    public function subscribe(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'plan_id' => 'required|integer|in:1,2,3',
        ]);

        $user = $request->user();

        $plans = [
            1 => ['duration' => '1 mois', 'months' => 1, 'price' => 19.99, 'stripe_price_id' => config('services.stripe.price_1_month')],
            2 => ['duration' => '3 mois', 'months' => 3, 'price' => 44.99, 'stripe_price_id' => config('services.stripe.price_3_months')],
            3 => ['duration' => '6 mois', 'months' => 6, 'price' => 69.99, 'stripe_price_id' => config('services.stripe.price_6_months')],
        ];

        $plan = $plans[$validated['plan_id']] ?? null;

        if (! $plan) {
            return back()->with('error', 'Plan invalide.');
        }

        // Create Stripe Checkout session for subscription
        if (empty($plan['stripe_price_id'])) {
            logger()->error('Stripe price ID missing for Premium plan', ['plan_id' => $validated['plan_id']]);

            return back()->with('error', 'Le paiement Premium est temporairement indisponible.');
        }

        $checkoutUrl = $this->stripeService->createPremiumSubscription(
            priceId: $plan['stripe_price_id'],
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
}
