<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SessionController extends Controller
{
    public function index(Request $request): Response
    {
        $currentId = $request->session()->getId();
        $sessions = DB::table('sessions')->where('user_id', $request->user()->id)->orderByDesc('last_activity')->get()
            ->map(fn ($session) => ['id' => $session->id, 'ip_address' => $session->ip_address, 'user_agent' => $session->user_agent, 'last_activity' => now()->setTimestamp($session->last_activity)->toISOString(), 'is_current' => $session->id === $currentId]);

        return Inertia::render('settings/sessions', ['sessions' => $sessions]);
    }

    public function destroyOthers(Request $request): RedirectResponse
    {
        $request->validate(['password' => ['required', 'current_password']]);
        DB::table('sessions')->where('user_id', $request->user()->id)->where('id', '!=', $request->session()->getId())->delete();

        return back()->with('success', 'Les autres sessions ont été déconnectées.');
    }
}
