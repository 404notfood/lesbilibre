<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use App\Models\User;
use App\Services\PushEndpointPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;

class PushSubscriptionController extends Controller
{
    public function store(Request $request, PushEndpointPolicy $policy): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'string', 'url', 'max:500'],
            'keys.p256dh' => ['required', 'string', 'max:100'],
            'keys.auth' => ['required', 'string', 'max:30'],
            'contentEncoding' => ['sometimes', 'string', 'in:aesgcm,aes128gcm'],
        ]);

        try {
            $policy->host($validated['endpoint']);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['endpoint' => $exception->getMessage()]);
        }
        try {
            $policy->validateKeys($validated['keys']['p256dh'], $validated['keys']['auth']);
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['keys' => $exception->getMessage()]);
        }
        DB::transaction(function () use ($request, $validated) {
            $owner = User::whereKey($request->user()->id)->lockForUpdate()->firstOrFail();
            $existing = PushSubscription::where('endpoint', $validated['endpoint'])->first();
            abort_if($existing && $existing->user_id !== $owner->id, 409, 'Cette souscription appartient déjà à un autre compte.');
            if (! $existing && PushSubscription::where('user_id', $owner->id)->count() >= config('webpush.max_subscriptions_per_user', 10)) {
                throw ValidationException::withMessages(['endpoint' => 'Le nombre maximal d’appareils a été atteint.']);
            }
            PushSubscription::updateOrCreate(['endpoint' => $validated['endpoint']], [
                'user_id' => $owner->id,
                'p256dh_key' => $validated['keys']['p256dh'],
                'auth_token' => $validated['keys']['auth'],
                'content_encoding' => $validated['contentEncoding'] ?? 'aes128gcm',
            ]);
        });
        $request->session()->put('pwa.push_endpoint', $validated['endpoint']);

        return response()->json(['message' => 'Subscription enregistree.']);
    }

    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url'],
        ]);

        PushSubscription::query()
            ->where('user_id', $request->user()->id)
            ->where('endpoint', $validated['endpoint'])
            ->delete();
        if ($request->session()->get('pwa.push_endpoint') === $validated['endpoint']) {
            $request->session()->forget('pwa.push_endpoint');
        }

        return response()->json(['message' => 'Subscription supprimee.']);
    }

    public function vapidPublicKey(): JsonResponse
    {
        return response()->json([
            'publicKey' => config('services.webpush.vapid_public_key'),
        ]);
    }
}
