<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class CommunityController extends Controller
{
    public function correctDate(Request $request, \App\Models\User $user)
    {
        abort_unless($request->user()->is_admin, 403);
        $data = $request->validate(['date_of_birth' => ['required', new \App\Rules\AdultBirthDate], 'reason' => ['required', 'string', 'min:10', 'max:1000']]);
        abort_unless($user->profile, 404);
        $user->profile->update(['date_of_birth' => $data['date_of_birth'], 'birth_date_declared_at' => now()]);
        app(\App\Services\ModerationAuditService::class)->record($request->user(), $user, 'declared_birth_date_corrected', $user, 'member_request', $data['reason']);

        return back()->with('success', 'Date déclarée corrigée et décision journalisée. Cela ne constitue pas une preuve de majorité.');
    }

    public function show(Request $request)
    {
        return Inertia::render('Community/Onboarding', [
            'declared' => (bool) $request->user()->profile?->birth_date_declared_at && $request->user()->profile?->date_of_birth && ! $request->user()->profile->date_of_birth->isFuture() && $request->user()->profile->date_of_birth->age >= 18,
            'charterAccepted' => $request->user()->data_processing_consent && $request->user()->community_charter_version === config('community.charter_version'),
            'photosVerified' => (bool) $request->user()->is_verified,
            'restricted' => (bool) $request->user()->safety_restricted_at,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'date_of_birth' => ['required', new \App\Rules\AdultBirthDate],
            'community_charter' => ['accepted'],
            'data_processing_consent' => ['accepted'],
        ]);
        $user = $request->user();
        abort_if($user->safety_restricted_at, 403, 'Contactez la modération pour demander un réexamen.');
        $profile = $user->profile;
        if ($profile?->birth_date_declared_at && $user->is_verified && $profile->date_of_birth?->toDateString() !== $data['date_of_birth']) {
            throw \Illuminate\Validation\ValidationException::withMessages(['date_of_birth' => 'Pour corriger cette date, contactez la modération.']);
        }
        \Illuminate\Support\Facades\DB::transaction(function () use ($user, $data) {
            $user->profile()->updateOrCreate([], ['date_of_birth' => $data['date_of_birth'], 'birth_date_declared_at' => now()]);
            $user->forceFill(['community_charter_accepted_at' => now(), 'community_charter_version' => config('community.charter_version'), 'data_processing_consent' => true, 'data_processing_consented_at' => now()])->save();
        });

        return redirect()->route($user->is_verified ? 'dashboard' : 'verification.create');
    }
}
