<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use RuntimeException;

class WebPushService
{
    public function __construct(private PushEndpointPolicy $policy) {}

    /** @param array{title: string, body: string, url?: string, tag?: string, actions?: array} $payload */
    public function sendToUser(User $user, array $payload): void
    {
        $current = User::find($user->id);
        if (! $current || ! $current->canUseCommunity() || ! config('services.webpush.vapid_public_key') || ! config('services.webpush.vapid_private_key')) {
            return;
        }
        $subscriptions = PushSubscription::where('user_id', $current->id)->get();
        foreach ($subscriptions as $stored) {
            try {
                $this->policy->validateKeys($stored->p256dh_key, $stored->auth_token);
                $options = $this->policy->clientOptions($stored->endpoint);
            } catch (InvalidArgumentException $exception) {
                // Old/malicious subscriptions must not become outbound traffic.
                $stored->delete();
                Log::warning('Rejected unsafe push subscription', ['subscription_id' => $stored->id]);

                continue;
            }
            $client = $this->makeWebPush($options);
            $client->queueNotification(Subscription::create([
                'endpoint' => $stored->endpoint,
                'publicKey' => $stored->p256dh_key,
                'authToken' => $stored->auth_token,
                'contentEncoding' => $stored->content_encoding,
            ]), json_encode($payload, JSON_THROW_ON_ERROR));
            foreach ($client->flush() as $report) {
                if ($report->isSubscriptionExpired()) {
                    $stored->delete();
                    Log::info('Removed expired push subscription', ['subscription_id' => $stored->id]);
                } elseif (! $report->isSuccess()) {
                    // Do not include endpoint tokens, private payloads or raw
                    // transport errors in logs. A queued listener can retry.
                    Log::warning('Push delivery failed', ['subscription_id' => $stored->id]);
                    throw new RuntimeException('Push delivery failed.');
                }
            }
        }
    }

    protected function makeWebPush(array $clientOptions): WebPush
    {
        return new WebPush(['VAPID' => [
            'subject' => config('app.url'),
            'publicKey' => config('services.webpush.vapid_public_key'),
            'privateKey' => config('services.webpush.vapid_private_key'),
        ]], [], 10, $clientOptions);
    }
}
