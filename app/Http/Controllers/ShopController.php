<?php

namespace App\Http\Controllers;

use App\Services\StripePaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShopController extends Controller
{
    public function __construct(
        protected StripePaymentService $stripeService
    ) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $gemPackages = [
            ['id' => 1, 'amount' => 100, 'price' => 4.99, 'bonus' => 0, 'popular' => false],
            ['id' => 2, 'amount' => 250, 'price' => 9.99, 'bonus' => 25, 'popular' => false],
            ['id' => 3, 'amount' => 500, 'price' => 19.99, 'bonus' => 75, 'popular' => true],
            ['id' => 4, 'amount' => 1000, 'price' => 34.99, 'bonus' => 200, 'popular' => false],
            ['id' => 5, 'amount' => 2500, 'price' => 79.99, 'bonus' => 600, 'popular' => false],
        ];

        $gifts = [
            // Romantique
            ['id' => 1, 'name' => 'Rose Rouge', 'emoji' => '🌹', 'price' => 10, 'category' => 'romantic'],
            ['id' => 2, 'name' => 'Bouquet', 'emoji' => '💐', 'price' => 25, 'category' => 'romantic'],
            ['id' => 3, 'name' => 'Coeur', 'emoji' => '💖', 'price' => 15, 'category' => 'romantic'],
            ['id' => 4, 'name' => 'Bague', 'emoji' => '💍', 'price' => 50, 'category' => 'romantic'],

            // Fun
            ['id' => 5, 'name' => 'Café', 'emoji' => '☕', 'price' => 5, 'category' => 'fun'],
            ['id' => 6, 'name' => 'Champagne', 'emoji' => '🍾', 'price' => 30, 'category' => 'fun'],
            ['id' => 7, 'name' => 'Gâteau', 'emoji' => '🎂', 'price' => 20, 'category' => 'fun'],
            ['id' => 8, 'name' => 'Cocktail', 'emoji' => '🍹', 'price' => 15, 'category' => 'fun'],

            // Luxe
            ['id' => 9, 'name' => 'Couronne', 'emoji' => '👑', 'price' => 100, 'category' => 'luxury'],
            ['id' => 10, 'name' => 'Diamant', 'emoji' => '💎', 'price' => 150, 'category' => 'luxury'],
            ['id' => 11, 'name' => 'Voiture de Luxe', 'emoji' => '🚗', 'price' => 200, 'category' => 'luxury'],
            ['id' => 12, 'name' => 'Jet Privé', 'emoji' => '✈️', 'price' => 500, 'category' => 'luxury'],

            // Séduction
            ['id' => 13, 'name' => 'Bisou', 'emoji' => '💋', 'price' => 8, 'category' => 'seduction'],
            ['id' => 14, 'name' => 'Message Hot', 'emoji' => '🔥', 'price' => 12, 'category' => 'seduction'],
            ['id' => 15, 'name' => 'Lingerie', 'emoji' => '👙', 'price' => 35, 'category' => 'seduction'],
        ];

        return Inertia::render('Shop/Index', [
            'userGems' => $user->gems,
            'gemPackages' => $gemPackages,
            'gifts' => $gifts,
        ]);
    }

    public function purchaseGems(Request $request): RedirectResponse|\Illuminate\Http\Response
    {
        $validated = $request->validate([
            'package_id' => 'required|integer|between:1,5',
        ]);

        $user = $request->user();

        $packages = [
            1 => ['amount' => 100, 'price' => 4.99, 'bonus' => 0],
            2 => ['amount' => 250, 'price' => 9.99, 'bonus' => 25],
            3 => ['amount' => 500, 'price' => 19.99, 'bonus' => 75],
            4 => ['amount' => 1000, 'price' => 34.99, 'bonus' => 200],
            5 => ['amount' => 2500, 'price' => 79.99, 'bonus' => 600],
        ];

        $package = $packages[$validated['package_id']] ?? null;

        if (! $package) {
            return back()->with('error', 'Package invalide.');
        }

        $totalGems = $package['amount'] + $package['bonus'];

        // Create Stripe Checkout session
        $checkoutUrl = $this->stripeService->createGemCheckoutSession(
            amount: (int) ($package['price'] * 100), // Convert to cents
            gems: $totalGems,
            userId: $user->id
        );

        if (! $checkoutUrl) {
            return back()->with('error', 'Erreur lors de la création de la session de paiement. Veuillez réessayer.');
        }

        // Redirect to Stripe Checkout (external redirect for Inertia)
        return \Inertia\Inertia::location($checkoutUrl);
    }

    /**
     * Handle successful Stripe checkout return.
     */
    public function checkoutSuccess(Request $request): RedirectResponse
    {
        $sessionId = $request->query('session_id');

        if (! $sessionId) {
            return redirect()->route('shop.index')->with('error', 'Session invalide.');
        }

        // Verify session with Stripe
        $session = $this->stripeService->getSession($sessionId);

        if (! $session || $session->payment_status !== 'paid') {
            return redirect()->route('shop.index')->with('error', 'Paiement non confirmé.');
        }

        return redirect()->route('shop.index')->with('success', 'Merci pour votre achat ! Vos gemmes seront créditées sous peu.');
    }

    /**
     * Handle cancelled Stripe checkout.
     */
    public function checkoutCancel(): RedirectResponse
    {
        return redirect()->route('shop.index')->with('info', 'Achat annulé.');
    }

    public function sendGift(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'gift_id' => 'required|integer|between:1,15',
            'recipient_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $recipient = \App\Models\User::findOrFail($validated['recipient_id']);

        $gifts = [
            1 => ['name' => 'Rose Rouge', 'price' => 10],
            2 => ['name' => 'Bouquet', 'price' => 25],
            3 => ['name' => 'Coeur', 'price' => 15],
            4 => ['name' => 'Bague', 'price' => 50],
            5 => ['name' => 'Café', 'price' => 5],
            6 => ['name' => 'Champagne', 'price' => 30],
            7 => ['name' => 'Gâteau', 'price' => 20],
            8 => ['name' => 'Cocktail', 'price' => 15],
            9 => ['name' => 'Couronne', 'price' => 100],
            10 => ['name' => 'Diamant', 'price' => 150],
            11 => ['name' => 'Voiture de Luxe', 'price' => 200],
            12 => ['name' => 'Jet Privé', 'price' => 500],
            13 => ['name' => 'Bisou', 'price' => 8],
            14 => ['name' => 'Message Hot', 'price' => 12],
            15 => ['name' => 'Lingerie', 'price' => 35],
        ];

        $gift = $gifts[$validated['gift_id']] ?? null;

        if (! $gift) {
            return back()->with('error', 'Cadeau invalide.');
        }

        // Vérifier que l'utilisateur a assez de gemmes
        $gemService = app(\App\Services\GemService::class);
        $transaction = $gemService->deductGems(
            $user,
            $gift['price'],
            'spend',
            'gift_sent',
            "Cadeau envoyé : {$gift['name']} à {$recipient->name}",
            [
                'gift_id' => $validated['gift_id'],
                'gift_name' => $gift['name'],
                'recipient_id' => $recipient->id,
                'recipient_name' => $recipient->name,
                'message' => $validated['message'] ?? null,
            ]
        );

        if (! $transaction) {
            return back()->with('error', 'Vous n\'avez pas assez de gemmes.');
        }

        // Crédit au destinataire (10% de la valeur)
        $recipientBonus = (int) ceil($gift['price'] * 0.1);
        $gemService->addGems(
            $recipient,
            $recipientBonus,
            'earn',
            'gift_received',
            "Cadeau reçu : {$gift['name']} de {$user->name}",
            [
                'gift_id' => $validated['gift_id'],
                'gift_name' => $gift['name'],
                'sender_id' => $user->id,
                'sender_name' => $user->name,
                'message' => $validated['message'] ?? null,
            ]
        );

        // Envoyer une notification au destinataire
        \App\Models\Notification::createNotification(
            $recipient->id,
            'gift',
            'Nouveau cadeau reçu ! 🎁',
            "{$user->name} vous a envoyé : {$gift['name']}",
            [
                'gift_id' => $validated['gift_id'],
                'gift_name' => $gift['name'],
                'sender_id' => $user->id,
                'sender_name' => $user->name,
                'message' => $validated['message'] ?? null,
                'gems_bonus' => $recipientBonus,
            ]
        );

        return back()->with('success', "Cadeau envoyé à {$recipient->name} !");
    }
}
