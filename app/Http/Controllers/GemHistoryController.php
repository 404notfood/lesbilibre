<?php

namespace App\Http\Controllers;

use App\Services\GemService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class GemHistoryController extends Controller
{
    public function __construct(private GemService $gemService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();

        $transactions = $this->gemService->getTransactionHistory($user, 100)
            ->map(fn (\App\Models\GemTransaction $transaction) => [
                'id' => $transaction->id,
                'amount' => $transaction->amount,
                'balance_after' => $transaction->balance_after,
                'type' => $transaction->type,
                'reason' => $transaction->reason,
                'description' => $transaction->displayDescription(),
                'created_at' => $transaction->created_at->toISOString(),
            ]);

        return Inertia::render('Gems/History', [
            'transactions' => $transactions,
            'currentBalance' => $user->gems,
        ]);
    }
}
