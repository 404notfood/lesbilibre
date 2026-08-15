<?php

namespace App\Http\Controllers;

use App\Models\GemPackage;
use App\Services\StripePaymentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
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

        // Gem packages — managed from the admin console (gem_packages table)
        $gemPackages = GemPackage::offered()->get()->map(fn (GemPackage $package) => [
            'id' => $package->id,
            'name' => $package->name,
            'amount' => $package->amount,
            'price' => (float) $package->price,
            'bonus' => $package->bonus,
            'popular' => $package->is_featured,
        ])->values();

        $acceptsNaughty = (bool) $user->profile?->is_naughty_mode;

        $gifts = collect(config('gifts'))
            ->reject(fn (array $gift) => $gift['category'] === 'naughty' && ! $acceptsNaughty)
            ->map(fn (array $gift, int $id) => ['id' => $id] + $gift)
            ->values();

        return Inertia::render('Shop/Index', [
            'userGems' => $user->gems,
            'gemPackages' => $gemPackages,
            'gifts' => $gifts,
            'giftRecipient' => $this->resolveGiftRecipient($request),
        ]);
    }

    /**
     * Destinataire présélectionnée via `?gift_to=` (bouton « Cadeau » d'un profil).
     *
     * @return array{id: int, name: string, pseudo: string|null}|null
     */
    protected function resolveGiftRecipient(Request $request): ?array
    {
        $recipientId = $request->integer('gift_to');

        if ($recipientId <= 0 || $recipientId === $request->user()->id) {
            return null;
        }

        $recipient = \App\Models\User::query()
            ->where('is_banned', false)
            ->find($recipientId);

        if ($recipient === null) {
            return null;
        }

        return [
            'id' => $recipient->id,
            'name' => $recipient->name,
            'pseudo' => $recipient->pseudo,
        ];
    }

    public function purchaseGems(Request $request): RedirectResponse|\Illuminate\Http\Response
    {
        $validated = $request->validate([
            'package_id' => ['required', 'integer', 'exists:gem_packages,id'],
        ]);

        $user = $request->user();

        $package = GemPackage::find($validated['package_id']);

        if (! $package || ! $package->is_active) {
            return back()->with('error', 'Ce pack n’est plus disponible.');
        }

        // Create Stripe Checkout session
        $checkoutUrl = $this->stripeService->createGemCheckoutSession(
            amount: (int) round((float) $package->price * 100), // Convert to cents
            gems: $package->totalGems(),
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
            'gift_id' => ['required', 'integer', Rule::in(array_keys(config('gifts')))],
            'recipient_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $recipient = \App\Models\User::findOrFail($validated['recipient_id']);

        $gift = config('gifts')[$validated['gift_id']] ?? null;

        if (! $gift) {
            return back()->with('error', 'Cadeau invalide.');
        }

        if ($gift['category'] === 'naughty' && ! $user->profile?->is_naughty_mode) {
            return back()->with('error', 'Activez le mode coquin pour offrir ce cadeau.');
        }

        if ($recipient->id === $user->id) {
            return back()->with('error', 'Vous ne pouvez pas vous offrir un cadeau.');
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
