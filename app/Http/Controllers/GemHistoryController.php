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

        $transactions = $this->gemService->getTransactionHistory($user, 100);

        return Inertia::render('Gems/History', [
            'transactions' => $transactions,
            'currentBalance' => $user->gems,
        ]);
    }
}
