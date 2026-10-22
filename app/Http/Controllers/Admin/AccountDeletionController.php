<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AccountErasure;
use App\Models\User;
use App\Services\AccountErasureService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountDeletionController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/AccountDeletions/Index', [
            'requests' => AccountErasure::where('status', '!=', 'completed')->oldest()->get()->map(fn ($erasure) => [
                'id' => $erasure->id,
                'pseudo' => User::withTrashed()->find($erasure->user_id)?->pseudo ?? 'Compte fermé',
                'status' => $erasure->status,
                'billing_pending' => $erasure->billing_pending,
                'failure_stage' => $erasure->failure_stage,
                'created_at' => $erasure->created_at->toISOString(),
            ]),
        ]);
    }

    public function destroy(Request $request, AccountErasure $erasure, AccountErasureService $service)
    {
        $request->validate(['confirmation' => ['required', 'in:EFFACER']]);
        $service->erase(User::withTrashed()->findOrFail($erasure->user_id), $request->user());

        return back()->with('success', 'Effacement terminé. Les preuves de signalements sont conservées pour leur traitement.');
    }
}
