<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SubscriptionController extends Controller
{
    /**
     * Display a listing of subscriptions.
     */
    public function index(Request $request): Response
    {
        $query = Subscription::with('user');

        // Search filter
        if ($search = $request->input('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        // Plan filter
        if ($plan = $request->input('plan')) {
            $query->where('plan', $plan);
        }

        // Sort (whitelist to prevent SQL injection)
        $allowedSortColumns = ['created_at', 'plan', 'amount', 'status', 'starts_at', 'expires_at'];
        $sortBy = in_array($request->input('sort_by'), $allowedSortColumns) ? $request->input('sort_by') : 'created_at';
        $sortDirection = $request->input('sort_direction') === 'asc' ? 'asc' : 'desc';
        $query->orderBy($sortBy, $sortDirection);

        $subscriptions = $query->paginate(20)->withQueryString();

        // Transform data
        $subscriptions->getCollection()->transform(fn ($subscription) => [
            'id' => $subscription->id,
            'user' => [
                'id' => $subscription->user->id,
                'name' => $subscription->user->name,
                'email' => $subscription->user->email,
                'is_premium' => $subscription->user->is_premium,
                'is_banned' => $subscription->user->is_banned,
            ],
            'plan' => $subscription->plan,
            'amount' => $subscription->amount,
            'status' => $subscription->status,
            'payment_method' => $subscription->payment_method,
            'current_period_start' => $subscription->current_period_start?->format('Y-m-d H:i'),
            'current_period_end' => $subscription->current_period_end?->format('Y-m-d H:i'),
            'starts_at' => $subscription->starts_at?->format('Y-m-d'),
            'expires_at' => $subscription->expires_at?->format('Y-m-d'),
            // Jours restants : négatif si la date est dépassée, null si aucune
            // échéance (abonnement illimité).
            'days_remaining' => $subscription->expires_at
                ? (int) now()->startOfDay()->diffInDays($subscription->expires_at->startOfDay(), false)
                : null,
            'created_at' => $subscription->created_at->diffForHumans(),
        ]);

        return Inertia::render('Admin/Subscriptions/Index', [
            'subscriptions' => $subscriptions,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'plan' => $plan,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'stats' => [
                'total' => Subscription::count(),
                'active' => Subscription::where('status', 'active')->count(),
                'canceled' => Subscription::where('status', 'canceled')->count(),
                'expired' => Subscription::where('status', 'expired')->count(),
                // Encore marqués actifs alors que la date est passée : la tâche
                // subscriptions:expire n'est pas passée (ou le cron est arrêté).
                'stale' => Subscription::where('status', 'active')
                    ->whereNotNull('expires_at')
                    ->where('expires_at', '<=', now())
                    ->count(),
                'expiring_soon' => Subscription::where('status', 'active')
                    ->whereNotNull('expires_at')
                    ->whereBetween('expires_at', [now(), now()->addDays(7)])
                    ->count(),
                'mrr' => Subscription::where('status', 'active')
                    ->where(function ($query) {
                        $query->whereNull('expires_at')
                            ->orWhere('expires_at', '>', now());
                    })
                    ->sum('amount'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new subscription.
     */
    public function create(Request $request): Response
    {
        $userId = $request->input('user_id');
        $user = $userId ? User::find($userId) : null;

        // Recherche par nom, pseudo ou e-mail : retrouver un compte sans
        // connaître son identifiant numérique.
        $candidates = collect();

        if (! $user && ($search = trim((string) $request->input('search'))) !== '') {
            $candidates = User::query()
                ->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('pseudo', 'like', "%{$search}%");
                })
                ->limit(10)
                ->get(['id', 'name', 'email', 'pseudo', 'is_premium'])
                ->map(fn (User $candidate) => [
                    'id' => $candidate->id,
                    'name' => $candidate->name,
                    'email' => $candidate->email,
                    'pseudo' => $candidate->pseudo,
                    'is_premium' => $candidate->is_premium,
                ]);
        }

        return Inertia::render('Admin/Subscriptions/Create', [
            'user' => $user ? [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_premium' => $user->is_premium,
            ] : null,
            'candidates' => $candidates,
            'search' => $request->input('search'),
        ]);
    }

    /**
     * Store a newly created subscription.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'plan' => ['required', 'in:monthly,yearly'],
            'amount' => ['required', 'numeric', 'min:0'],
            'starts_at' => ['required', 'date'],
            'duration_months' => ['required', 'integer', 'min:1', 'max:24'],
        ]);

        $user = User::findOrFail($validated['user_id']);

        // Cancel existing active subscriptions
        $user->subscriptions()
            ->where('status', 'active')
            ->update(['status' => 'canceled']);

        // Calculate expiration date
        $startsAt = \Carbon\Carbon::parse($validated['starts_at']);
        $expiresAt = $startsAt->copy()->addMonths($validated['duration_months']);

        // Create subscription
        $subscription = Subscription::create([
            'user_id' => $validated['user_id'],
            'plan' => $validated['plan'],
            'amount' => $validated['amount'],
            'status' => 'active',
            'starts_at' => $startsAt,
            'expires_at' => $expiresAt,
            'current_period_start' => $startsAt,
            'current_period_end' => $expiresAt,
            'payment_method' => 'admin',
        ]);

        // Update user premium status
        $user->is_premium = true;
        $user->premium_expires_at = $expiresAt;
        $user->save();

        return redirect()
            ->route('admin.subscriptions.index')
            ->with('success', 'Abonnement créé avec succès.');
    }

    /**
     * Display the specified subscription.
     */
    public function show(Subscription $subscription): Response
    {
        $subscription->load('user');

        return Inertia::render('Admin/Subscriptions/Show', [
            'subscription' => [
                'id' => $subscription->id,
                'user' => [
                    'id' => $subscription->user->id,
                    'name' => $subscription->user->name,
                    'email' => $subscription->user->email,
                ],
                'plan' => $subscription->plan,
                'amount' => $subscription->amount,
                'status' => $subscription->status,
                'stripe_subscription_id' => $subscription->stripe_subscription_id,
                'stripe_customer_id' => $subscription->stripe_customer_id,
                'stripe_price_id' => $subscription->stripe_price_id,
                'current_period_start' => $subscription->current_period_start,
                'current_period_end' => $subscription->current_period_end,
                'starts_at' => $subscription->starts_at,
                'expires_at' => $subscription->expires_at,
                'payment_method' => $subscription->payment_method,
                'created_at' => $subscription->created_at,
                'updated_at' => $subscription->updated_at,
            ],
        ]);
    }

    /**
     * Show the form for editing a subscription.
     */
    public function edit(Subscription $subscription): Response
    {
        $subscription->load('user');

        return Inertia::render('Admin/Subscriptions/Edit', [
            'subscription' => [
                'id' => $subscription->id,
                'user' => [
                    'id' => $subscription->user->id,
                    'name' => $subscription->user->name,
                    'email' => $subscription->user->email,
                ],
                'plan' => $subscription->plan,
                'amount' => $subscription->amount,
                'starts_at' => $subscription->starts_at?->format('Y-m-d'),
                'expires_at' => $subscription->expires_at?->format('Y-m-d'),
            ],
        ]);
    }

    /**
     * Update the specified subscription.
     */
    public function update(Request $request, Subscription $subscription): RedirectResponse
    {
        $validated = $request->validate([
            'plan' => ['required', 'in:monthly,yearly'],
            'amount' => ['required', 'numeric', 'min:0'],
            'starts_at' => ['required', 'date'],
            'expires_at' => ['required', 'date', 'after:starts_at'],
        ]);

        $subscription->update([
            'plan' => $validated['plan'],
            'amount' => $validated['amount'],
            'starts_at' => $validated['starts_at'],
            'expires_at' => $validated['expires_at'],
            'current_period_start' => $validated['starts_at'],
            'current_period_end' => $validated['expires_at'],
        ]);

        // Update user premium status
        $subscription->user->is_premium = true;
        $subscription->user->premium_expires_at = $validated['expires_at'];
        $subscription->user->save();

        return redirect()
            ->route('admin.subscriptions.show', $subscription->id)
            ->with('success', 'Abonnement modifié avec succès.');
    }

    /**
     * Extend a subscription.
     */
    public function extend(Request $request, Subscription $subscription): RedirectResponse
    {
        $validated = $request->validate([
            'months' => ['required', 'integer', 'min:1', 'max:24'],
        ]);

        $expiresAt = $subscription->expires_at ?? now();
        $newExpiresAt = \Carbon\Carbon::parse($expiresAt)->addMonths($validated['months']);

        $subscription->update([
            'expires_at' => $newExpiresAt,
            'current_period_end' => $newExpiresAt,
        ]);

        // Update user premium status
        $subscription->user->is_premium = true;
        $subscription->user->premium_expires_at = $newExpiresAt;
        $subscription->user->save();

        return redirect()
            ->back()
            ->with('success', "Abonnement prolongé de {$validated['months']} mois.");
    }

    /**
     * Cancel a subscription.
     */
    public function cancel(Subscription $subscription): RedirectResponse
    {
        $subscription->update([
            'status' => 'canceled',
        ]);

        // Update user premium status if no other active subscriptions
        $hasOtherActiveSubscription = $subscription->user->subscriptions()
            ->where('id', '!=', $subscription->id)
            ->where('status', 'active')
            ->exists();

        if (! $hasOtherActiveSubscription) {
            $subscription->user->is_premium = false;
            $subscription->user->premium_expires_at = null;
            $subscription->user->save();
        }

        return redirect()
            ->back()
            ->with('success', 'Abonnement annulé avec succès.');
    }

    /**
     * Reactivate a subscription.
     */
    public function reactivate(Subscription $subscription): RedirectResponse
    {
        $subscription->update([
            'status' => 'active',
        ]);

        // Update user premium status
        $subscription->user->is_premium = true;
        $subscription->user->premium_expires_at = $subscription->expires_at;
        $subscription->user->save();

        return redirect()
            ->back()
            ->with('success', 'Abonnement réactivé avec succès.');
    }

    /**
     * Delete a subscription.
     */
    public function destroy(Subscription $subscription): RedirectResponse
    {
        $userId = $subscription->user_id;

        $subscription->delete();

        // Update user premium status if no other active subscriptions
        $hasActiveSubscription = Subscription::where('user_id', $userId)
            ->where('status', 'active')
            ->exists();

        if (! $hasActiveSubscription) {
            $userToUpdate = User::find($userId);
            $userToUpdate->is_premium = false;
            $userToUpdate->premium_expires_at = null;
            $userToUpdate->save();
        }

        return redirect()
            ->route('admin.subscriptions.index')
            ->with('success', 'Abonnement supprimé avec succès.');
    }
}
