<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class WebPushService
{
    private WebPush $webPush;

    public function __construct()
    {
        $this->webPush = new WebPush([
            'VAPID' => [
                'subject' => config('app.url'),
                'publicKey' => config('services.webpush.vapid_public_key'),
                'privateKey' => config('services.webpush.vapid_private_key'),
            ],
        ]);

        $this->webPush->setAutomaticPadding(false);
    }

    /**
     * @param array{title: string, body: string, url?: string, tag?: string, actions?: array<int, array{action: string, title: string}>} $payload
     */
    public function sendToUser(User $user, array $payload): void
    {
        $subscriptions = PushSubscription::query()
            ->where('user_id', $user->id)
            ->get();

        if ($subscriptions->isEmpty()) {
            return;
        }

        $jsonPayload = json_encode($payload, JSON_THROW_ON_ERROR);

        foreach ($subscriptions as $pushSubscription) {
            $subscription = Subscription::create([
                'endpoint' => $pushSubscription->endpoint,
                'publicKey' => $pushSubscription->p256dh_key,
                'authToken' => $pushSubscription->auth_token,
                'contentEncoding' => $pushSubscription->content_encoding,
            ]);

            $this->webPush->queueNotification($subscription, $jsonPayload);
        }

        foreach ($this->webPush->flush() as $report) {
            if ($report->isSubscriptionExpired()) {
                PushSubscription::query()
                    ->where('endpoint', $report->getEndpoint())
                    ->delete();

                Log::info('Removed expired push subscription', ['endpoint' => $report->getEndpoint()]);
            }
        }
    }
}
