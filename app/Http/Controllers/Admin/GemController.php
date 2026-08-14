<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GemTransaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class GemController extends Controller
{
    /**
     * Display the gem management interface for a user.
     */
    public function show(User $user): Response
    {
        // Get recent gem transactions
        $transactions = GemTransaction::where('user_id', $user->id)
            ->latest()
            ->limit(20)
            ->get()
            ->map(fn ($transaction) => [
                'id' => $transaction->id,
                'type' => $transaction->type,
                'amount' => $transaction->amount,
                'balance_after' => $transaction->balance_after,
                'description' => $transaction->description,
                'created_at' => $transaction->created_at->diffForHumans(),
            ]);

        return Inertia::render('Admin/Gems/Show', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'gems' => $user->gems,
            ],
            'transactions' => $transactions,
        ]);
    }

    /**
     * Add gems to a user.
     */
    public function add(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1', 'max:10000'],
            'description' => ['required', 'string', 'max:255'],
        ]);

        DB::transaction(function () use ($user, $validated) {
            $user->increment('gems', $validated['amount']);
            $user->refresh();

            GemTransaction::create([
                'user_id' => $user->id,
                'type' => 'admin_add',
                'amount' => $validated['amount'],
                'balance_after' => $user->gems,
                'description' => $validated['description'],
                'payment_method' => 'admin',
            ]);
        });

        return redirect()
            ->back()
            ->with('success', "{$validated['amount']} gems ajoutés avec succès.");
    }

    /**
     * Remove gems from a user.
     */
    public function remove(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'description' => ['required', 'string', 'max:255'],
        ]);

        $amountToRemove = 0;

        DB::transaction(function () use ($user, $validated, &$amountToRemove) {
            $amountToRemove = min($validated['amount'], $user->gems);
            $user->decrement('gems', $amountToRemove);
            $user->refresh();

            GemTransaction::create([
                'user_id' => $user->id,
                'type' => 'admin_remove',
                'amount' => -$amountToRemove,
                'balance_after' => $user->gems,
                'description' => $validated['description'],
                'payment_method' => 'admin',
            ]);
        });

        return redirect()
            ->back()
            ->with('success', "{$amountToRemove} gems retirés avec succès.");
    }
}
