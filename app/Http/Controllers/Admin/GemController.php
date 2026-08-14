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
     * Display the gem economy overview: circulation, flows and recent movements.
     */
    public function index(Request $request): Response
    {
        $type = $request->query('type');

        $transactions = GemTransaction::with('user:id,name,pseudo')
            ->when($type, fn ($query) => $query->where('type', $type))
            ->when($request->query('search'), function ($query, $search) {
                $query->whereHas('user', function ($inner) use ($search) {
                    $inner->where('pseudo', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(30)
            ->withQueryString()
            ->through(fn (GemTransaction $transaction) => [
                'id' => $transaction->id,
                'type' => $transaction->type,
                'amount' => $transaction->amount,
                'balance_after' => $transaction->balance_after,
                'description' => $transaction->description,
                'user' => $transaction->user,
                'created_at' => $transaction->created_at->toISOString(),
            ]);

        // Positive movements are gems entering circulation, negative ones are
        // gems being spent. Summing the raw amount would cancel them out.
        $issued = (int) GemTransaction::where('amount', '>', 0)->sum('amount');
        $spent = (int) abs(GemTransaction::where('amount', '<', 0)->sum('amount'));

        $stats = [
            'in_circulation' => (int) User::sum('gems'),
            'issued' => $issued,
            'spent' => $spent,
            'revenue' => round((float) GemTransaction::sum('price'), 2),
        ];

        $byType = GemTransaction::query()
            ->selectRaw('type, count(*) as movements, sum(amount) as total')
            ->groupBy('type')
            ->orderByRaw('count(*) desc')
            ->get()
            ->map(fn ($row) => [
                'type' => $row->type,
                'movements' => (int) $row->movements,
                'total' => (int) $row->total,
            ]);

        $topHolders = User::query()
            ->where('gems', '>', 0)
            ->orderByDesc('gems')
            ->limit(10)
            ->get(['id', 'pseudo', 'gems'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'pseudo' => $user->pseudo,
                'gems' => $user->gems,
            ]);

        return Inertia::render('Admin/Gems/Index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'byType' => $byType,
            'topHolders' => $topHolders,
            'filters' => [
                'type' => $type,
                'search' => $request->query('search'),
            ],
        ]);
    }

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
