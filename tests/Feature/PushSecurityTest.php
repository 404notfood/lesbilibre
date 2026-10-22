<?php

namespace Tests\Feature;

use App\Enums\NotificationType;
use App\Events\LikeReceived;
use App\Events\MatchCreated;
use App\Events\MessageSent;
use App\Listeners\SendLikePushNotification;
use App\Listeners\SendMatchPushNotification;
use App\Listeners\SendMessagePushNotification;
use App\Models\BlockedUser;
use App\Models\Conversation;
use App\Models\Like;
use App\Models\Message;
use App\Models\NotificationPreference;
use App\Models\PushSubscription;
use App\Models\User;
use App\Models\UserMatch;
use App\Services\PushDnsResolver;
use App\Services\PushEndpointPolicy;
use App\Services\WebPushService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Minishlink\WebPush\WebPush;
use Mockery;
use Tests\Concerns\CreatesSyntheticPushKeys;
use Tests\TestCase;

class PushSecurityTest extends TestCase
{
    use CreatesSyntheticPushKeys, RefreshDatabase;

    public function test_only_https_provider_endpoints_are_accepted(): void
    {
        $user = User::factory()->communityMember()->create();
        foreach (['http://fcm.googleapis.com/push', 'https://127.0.0.1/private', 'https://169.254.169.254/meta', 'https://fcm.googleapis.com.evil.invalid/push', 'https://fcm.googleapis.com:8443/push', 'https://fcm.googleapis.com@127.0.0.1/private', 'https://fcm.googleapis.com/push#fragment'] as $endpoint) {
            $this->actingAs($user)->postJson('/push/subscribe', ['endpoint' => $endpoint, 'keys' => $this->syntheticPushKeys()])->assertUnprocessable()->assertJsonValidationErrors('endpoint');
        }
        $this->assertDatabaseCount('push_subscriptions', 0);
    }

    public function test_malformed_keys_cannot_be_persisted(): void
    {
        $this->actingAs(User::factory()->communityMember()->create())->postJson('/push/subscribe', [
            'endpoint' => 'https://fcm.googleapis.com/push', 'keys' => ['p256dh' => 'truncated', 'auth' => 'truncated'],
        ])->assertUnprocessable();
        $this->assertDatabaseCount('push_subscriptions', 0);
    }

    public function test_device_quota_does_not_block_updates_and_an_endpoint_cannot_be_stolen(): void
    {
        config(['webpush.max_subscriptions_per_user' => 1]);
        $user = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        $payload = ['endpoint' => 'https://fcm.googleapis.com/push/one', 'keys' => $this->syntheticPushKeys()];
        $this->actingAs($user)->postJson('/push/subscribe', $payload)->assertOk();
        $this->postJson('/push/subscribe', $payload)->assertOk();
        $this->postJson('/push/subscribe', ['endpoint' => 'https://fcm.googleapis.com/push/two', 'keys' => $this->syntheticPushKeys()])->assertUnprocessable();
        $this->actingAs($other)->postJson('/push/subscribe', $payload)->assertConflict();
        $this->assertDatabaseCount('push_subscriptions', 1);
        $this->assertDatabaseHas('push_subscriptions', ['user_id' => $user->id, 'endpoint' => $payload['endpoint']]);
    }

    public function test_private_dns_answers_including_mapped_ipv6_are_rejected_without_a_transport(): void
    {
        foreach (['127.0.0.1', '10.0.0.1', '169.254.169.254', '::1', '::ffff:127.0.0.1', 'fc00::1', 'fe80::1'] as $address) {
            $resolver = Mockery::mock(PushDnsResolver::class);
            $resolver->shouldReceive('addresses')->once()->with('fcm.googleapis.com')->andReturn([$address]);
            try {
                (new PushEndpointPolicy($resolver))->clientOptions('https://fcm.googleapis.com/push');
                $this->fail('Non-public DNS address must be rejected.');
            } catch (InvalidArgumentException) {
                $this->addToAssertionCount(1);
            }
        }
    }

    public function test_a_public_dns_result_is_pinned_and_redirects_and_proxies_are_disabled(): void
    {
        $resolver = Mockery::mock(PushDnsResolver::class);
        $resolver->shouldReceive('addresses')->once()->with('fcm.googleapis.com')->andReturn(['8.8.8.8']);
        $options = (new PushEndpointPolicy($resolver))->clientOptions('https://fcm.googleapis.com/push');
        $this->assertSame(['fcm.googleapis.com:443:8.8.8.8'], $options['curl'][CURLOPT_RESOLVE]);
        $this->assertFalse($options['allow_redirects']);
        $this->assertSame('', $options['curl'][CURLOPT_PROXY]);
    }

    public function test_unsafe_historical_subscriptions_never_reach_the_push_client(): void
    {
        config(['services.webpush.vapid_public_key' => 'synthetic', 'services.webpush.vapid_private_key' => 'synthetic']);
        $user = User::factory()->communityMember()->create();
        $keys = $this->syntheticPushKeys();
        PushSubscription::create(['user_id' => $user->id, 'endpoint' => 'http://127.0.0.1/private', 'p256dh_key' => $keys['p256dh'], 'auth_token' => $keys['auth']]);
        $resolver = Mockery::mock(PushDnsResolver::class);
        $resolver->shouldNotReceive('addresses');
        $service = new class(new PushEndpointPolicy($resolver)) extends WebPushService
        {
            protected function makeWebPush(array $clientOptions): WebPush
            {
                throw new \LogicException('No client must be created for an unsafe endpoint.');
            }
        };
        $service->sendToUser($user, ['title' => 'Synthetic', 'body' => 'Synthetic']);
        $this->assertDatabaseCount('push_subscriptions', 0);
    }

    private function messageEvent(): array
    {
        $sender = User::factory()->communityMember()->create();
        $recipient = User::factory()->communityMember()->create();
        $conversation = Conversation::factory()->between($sender, $recipient)->create();
        $message = Message::create(['conversation_id' => $conversation->id, 'sender_id' => $sender->id, 'content' => 'Synthetic private message', 'moderation_status' => 'approved']);
        NotificationPreference::create(['user_id' => $recipient->id, 'type' => 'new_message', 'frequency' => 'immediate']);

        return [$sender, $recipient, new MessageSent($message)];
    }

    public function test_message_push_hides_the_sender_and_content_by_default(): void
    {
        config(['webpush.show_sender_pseudo' => false]);
        [$sender, $recipient, $event] = $this->messageEvent();
        $client = Mockery::mock(WebPushService::class);
        $client->shouldReceive('sendToUser')->once()->withArgs(fn ($user, $payload) => $user->id === $recipient->id && $payload['title'] === 'LesbiLibre' && $payload['body'] === 'Tu as reçu un nouveau message.');
        (new SendMessagePushNotification($client))->handle($event);
    }

    public function test_unapproved_messages_never_trigger_push_and_the_optional_identity_is_only_a_pseudo(): void
    {
        config(['webpush.show_sender_pseudo' => true]);
        [$sender, $recipient, $event] = $this->messageEvent();
        $sender->update(['name' => 'Synthetic Real Name', 'pseudo' => 'synthetic-pseudo']);
        $client = Mockery::mock(WebPushService::class);
        $client->shouldReceive('sendToUser')->once()->withArgs(fn ($user, $payload) => $payload['title'] === 'Message de synthetic-pseudo' && $payload['body'] === 'Tu as reçu un nouveau message.');
        (new SendMessagePushNotification($client))->handle($event);
        $event->message->update(['moderation_status' => 'pending']);
        (new SendMessagePushNotification($client))->handle($event);
        $event->message->update(['moderation_status' => 'rejected']);
        (new SendMessagePushNotification($client))->handle($event);
    }

    public function test_queued_message_push_rechecks_a_new_block_or_restricted_account(): void
    {
        [$sender, $recipient, $event] = $this->messageEvent();
        BlockedUser::create(['blocker_id' => $recipient->id, 'blocked_id' => $sender->id]);
        $client = Mockery::mock(WebPushService::class);
        $client->shouldNotReceive('sendToUser');
        (new SendMessagePushNotification($client))->handle($event);
        BlockedUser::query()->delete();
        $sender->forceFill(['safety_restricted_at' => now()])->save();
        (new SendMessagePushNotification($client))->handle($event);
    }

    public function test_daily_and_disabled_message_preferences_never_receive_an_immediate_push(): void
    {
        [$sender, $recipient, $event] = $this->messageEvent();
        $client = Mockery::mock(WebPushService::class);
        $client->shouldNotReceive('sendToUser');
        foreach (['daily', 'weekly', 'never'] as $frequency) {
            NotificationPreference::where('user_id', $recipient->id)->update(['frequency' => $frequency]);
            (new SendMessagePushNotification($client))->handle($event);
        }
    }

    public function test_delayed_like_and_match_jobs_recheck_a_new_block(): void
    {
        $sender = User::factory()->communityMember()->create();
        $recipient = User::factory()->communityMember()->create();
        foreach ([NotificationType::LikeReceived, NotificationType::MatchCreated] as $type) {
            NotificationPreference::create(['user_id' => $recipient->id, 'type' => $type->value, 'frequency' => 'immediate']);
        }
        $like = Like::create(['user_id' => $sender->id, 'liked_user_id' => $recipient->id]);
        $match = UserMatch::create(['user1_id' => $sender->id, 'user2_id' => $recipient->id]);
        BlockedUser::create(['blocker_id' => $sender->id, 'blocked_id' => $recipient->id]);
        $client = Mockery::mock(WebPushService::class);
        $client->shouldNotReceive('sendToUser');
        (new SendLikePushNotification($client))->handle(new LikeReceived($like));
        (new SendMatchPushNotification($client))->handle(new MatchCreated($match, $recipient->id));
    }
}
