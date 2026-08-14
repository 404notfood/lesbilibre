<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushSubscriptionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['required', 'url', 'max:500'],
            'keys.p256dh' => ['required', 'string'],
            'keys.auth' => ['required', 'string'],
            'contentEncoding' => ['sometimes', 'string', 'in:aesgcm,aes128gcm'],
        ]);

        PushSubscription::query()->updateOrCreate(
            [
                'endpoint' => $validated['endpoint'],
            ],
            [
                'user_id' => $request->user()->id,
                'p256dh_key' => $validated['keys']['p256dh'],
                'auth_token' => $validated['keys']['auth'],
                'content_encoding' => $validated['contentEncoding'] ?? 'aesgcm',
            ]
        );

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

        return response()->json(['message' => 'Subscription supprimee.']);
    }

    public function vapidPublicKey(): JsonResponse
    {
        return response()->json([
            'publicKey' => config('services.webpush.vapid_public_key'),
        ]);
    }
}
