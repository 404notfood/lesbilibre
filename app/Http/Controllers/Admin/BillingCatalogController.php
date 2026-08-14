<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreGemPackageRequest;
use App\Http\Requests\Admin\StorePremiumPlanRequest;
use App\Models\GemPackage;
use App\Models\PremiumPlan;
use App\Models\Subscription;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BillingCatalogController extends Controller
{
    /**
     * Show the catalogue of premium plans and gem packages.
     */
    public function index(): Response
    {
        $plans = PremiumPlan::orderBy('display_order')
            ->orderBy('duration_months')
            ->get()
            ->map(fn (PremiumPlan $plan) => [
                'id' => $plan->id,
                'slug' => $plan->slug,
                'name' => $plan->name,
                'tagline' => $plan->tagline,
                'duration_months' => $plan->duration_months,
                'price' => (float) $plan->price,
                'price_per_month' => $plan->pricePerMonth(),
                'stripe_price_id' => $plan->stripe_price_id,
                'perks' => $plan->perks ?? [],
                'entitlements' => $plan->entitlements ?? [],
                'gems_on_signup' => $plan->gems_on_signup,
                'gems_per_month' => $plan->gems_per_month,
                'is_active' => $plan->is_active,
                'is_featured' => $plan->is_featured,
                'display_order' => $plan->display_order,
                'is_purchasable' => $plan->isPurchasable(),
                'active_subscriptions' => Subscription::where('plan', $plan->slug)
                    ->where('status', 'active')
                    ->count(),
            ]);

        $packages = GemPackage::orderBy('display_order')
            ->orderBy('amount')
            ->get()
            ->map(fn (GemPackage $package) => [
                'id' => $package->id,
                'name' => $package->name,
                'amount' => $package->amount,
                'bonus' => $package->bonus,
                'total_gems' => $package->totalGems(),
                'price' => (float) $package->price,
                'is_active' => $package->is_active,
                'is_featured' => $package->is_featured,
                'display_order' => $package->display_order,
            ]);

        return Inertia::render('Admin/Billing/Index', [
            'plans' => $plans,
            'packages' => $packages,
            'entitlementCatalog' => config('entitlements.catalog'),
            'freeLimits' => config('entitlements.free'),
        ]);
    }

    /**
     * Create a premium plan.
     */
    public function storePlan(StorePremiumPlanRequest $request): RedirectResponse
    {
        PremiumPlan::create($request->validated());

        return back()->with('success', 'Plan créé.');
    }

    /**
     * Update a premium plan.
     */
    public function updatePlan(StorePremiumPlanRequest $request, PremiumPlan $plan): RedirectResponse
    {
        $plan->update($request->validated());

        return back()->with('success', 'Plan mis à jour.');
    }

    /**
     * Delete a premium plan, unless members are still subscribed to it.
     */
    public function destroyPlan(PremiumPlan $plan): RedirectResponse
    {
        $active = Subscription::where('plan', $plan->slug)
            ->where('status', 'active')
            ->count();

        if ($active > 0) {
            return back()->with(
                'error',
                "Impossible de supprimer ce plan : {$active} abonnement(s) actif(s). Désactivez-le plutôt."
            );
        }

        $plan->delete();

        return back()->with('success', 'Plan supprimé.');
    }

    /**
     * Create a gem package.
     */
    public function storePackage(StoreGemPackageRequest $request): RedirectResponse
    {
        GemPackage::create($request->validated());

        return back()->with('success', 'Pack créé.');
    }

    /**
     * Update a gem package.
     */
    public function updatePackage(StoreGemPackageRequest $request, GemPackage $package): RedirectResponse
    {
        $package->update($request->validated());

        return back()->with('success', 'Pack mis à jour.');
    }

    /**
     * Delete a gem package.
     */
    public function destroyPackage(GemPackage $package): RedirectResponse
    {
        $package->delete();

        return back()->with('success', 'Pack supprimé.');
    }
}
