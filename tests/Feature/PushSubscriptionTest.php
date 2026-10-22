<?php

namespace Tests\Feature;

use App\Models\PushSubscription;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\CreatesSyntheticPushKeys;
use Tests\TestCase;

class PushSubscriptionTest extends TestCase
{
    use CreatesSyntheticPushKeys;
    use RefreshDatabase;

    public function test_guests_cannot_subscribe_to_push(): void
    {
        $this->postJson(route('push.subscribe'), [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test',
            'keys' => ['p256dh' => 'testkey', 'auth' => 'testauthkey'],
        ])->assertUnauthorized();
    }

    public function test_authenticated_user_can_subscribe_to_push(): void
    {
        $user = User::factory()->communityMember()->create();
        $keys = $this->syntheticPushKeys();

        $this->actingAs($user)->postJson(route('push.subscribe'), [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test123',
            'keys' => $keys,
        ])->assertOk();

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $user->id,
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test123',
            'p256dh_key' => $keys['p256dh'],
            'auth_token' => $keys['auth'],
        ]);
    }

    public function test_subscribe_updates_existing_subscription_for_same_endpoint(): void
    {
        $user = User::factory()->communityMember()->create();
        $endpoint = 'https://fcm.googleapis.com/fcm/send/existing';
        $keys = $this->syntheticPushKeys();

        PushSubscription::create([
            'user_id' => $user->id,
            'endpoint' => $endpoint,
            'p256dh_key' => 'old_key',
            'auth_token' => 'old_auth',
        ]);

        $this->actingAs($user)->postJson(route('push.subscribe'), [
            'endpoint' => $endpoint,
            'keys' => $keys,
        ])->assertOk();

        $this->assertDatabaseCount('push_subscriptions', 1);
        $this->assertDatabaseHas('push_subscriptions', [
            'endpoint' => $endpoint,
            'p256dh_key' => $keys['p256dh'],
            'auth_token' => $keys['auth'],
        ]);
    }

    public function test_logout_revokes_this_browsers_push_but_keeps_other_devices(): void
    {
        $user = User::factory()->communityMember()->create();
        $endpoint = 'https://fcm.googleapis.com/fcm/send/current-device';
        $otherEndpoint = 'https://fcm.googleapis.com/fcm/send/other-device';
        PushSubscription::create(['user_id' => $user->id, 'endpoint' => $otherEndpoint, 'p256dh_key' => 'synthetic', 'auth_token' => 'synthetic']);
        $this->actingAs($user)->postJson(route('push.subscribe'), ['endpoint' => $endpoint, 'keys' => $this->syntheticPushKeys()])->assertOk();
        $this->assertSame($endpoint, session('pwa.push_endpoint'));
        $this->post(route('logout'))->assertRedirect();
        $this->assertDatabaseMissing('push_subscriptions', ['user_id' => $user->id, 'endpoint' => $endpoint]);
        $this->assertDatabaseHas('push_subscriptions', ['user_id' => $user->id, 'endpoint' => $otherEndpoint]);
    }

    public function test_subscribe_requires_valid_endpoint(): void
    {
        $user = User::factory()->communityMember()->create();

        $this->actingAs($user)->postJson(route('push.subscribe'), [
            'endpoint' => 'not-a-url',
            'keys' => ['p256dh' => 'key', 'auth' => 'auth'],
        ])->assertUnprocessable();
    }

    public function test_subscribe_requires_keys(): void
    {
        $user = User::factory()->communityMember()->create();

        $this->actingAs($user)->postJson(route('push.subscribe'), [
            'endpoint' => 'https://fcm.googleapis.com/fcm/send/test',
        ])->assertUnprocessable();
    }

    public function test_authenticated_user_can_unsubscribe_from_push(): void
    {
        $user = User::factory()->communityMember()->create();
        $endpoint = 'https://fcm.googleapis.com/fcm/send/to-remove';

        PushSubscription::create([
            'user_id' => $user->id,
            'endpoint' => $endpoint,
            'p256dh_key' => 'key',
            'auth_token' => 'auth',
        ]);

        $this->actingAs($user)->postJson(route('push.unsubscribe'), [
            'endpoint' => $endpoint,
        ])->assertOk();

        $this->assertDatabaseMissing('push_subscriptions', [
            'endpoint' => $endpoint,
        ]);
    }

    public function test_unsubscribe_does_not_remove_other_users_subscriptions(): void
    {
        $user1 = User::factory()->communityMember()->create();
        $user2 = User::factory()->communityMember()->create();
        $endpoint = 'https://fcm.googleapis.com/fcm/send/shared';

        PushSubscription::create([
            'user_id' => $user2->id,
            'endpoint' => $endpoint,
            'p256dh_key' => 'key',
            'auth_token' => 'auth',
        ]);

        $this->actingAs($user1)->postJson(route('push.unsubscribe'), [
            'endpoint' => $endpoint,
        ])->assertOk();

        $this->assertDatabaseHas('push_subscriptions', [
            'user_id' => $user2->id,
            'endpoint' => $endpoint,
        ]);
    }

    public function test_vapid_public_key_endpoint_returns_key(): void
    {
        $user = User::factory()->communityMember()->create();

        config(['services.webpush.vapid_public_key' => 'test-public-key-123']);

        $response = $this->actingAs($user)->getJson(route('push.vapid-key'));

        $response->assertOk();
        $response->assertJson(['publicKey' => 'test-public-key-123']);
    }
}
