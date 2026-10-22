<?php

namespace Tests\Feature;

use App\Models\AccountErasure;
use App\Models\Conversation;
use App\Models\EphemeralMedia;
use App\Models\Photo;
use App\Models\Report;
use App\Models\Subscription;
use App\Models\User;
use App\Services\StripePaymentService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Mockery;
use Tests\TestCase;

class AccountErasureReliabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_both_member_routes_close_preserve_media_and_notify_admin_until_explicit_erasure(): void
    {
        Storage::fake('public');
        Storage::fake('local');
        $admin = User::factory()->create(['is_admin' => true]);
        foreach (['settings.profile.destroy', 'settings.delete-account'] as $route) {
            $user = User::factory()->communityMember()->create();
            $photo = Photo::factory()->approved()->create(['user_id' => $user->id]);
            Storage::disk('public')->put($photo->path, 'synthetic image');
            $this->actingAs($user)->delete(route($route), $route === 'settings.profile.destroy' ? ['password' => 'password'] : ['confirmation' => 'SUPPRIMER'])
                ->assertSessionHasNoErrors()->assertRedirect('/');
            Storage::disk('public')->assertExists($photo->path);
            $this->assertSoftDeleted('users', ['id' => $user->id]);
            $this->assertSame($user->pseudo, User::withTrashed()->findOrFail($user->id)->pseudo);
            $this->assertDatabaseHas('account_erasures', ['user_id' => $user->id, 'status' => 'awaiting_admin', 'approved_at' => null]);
            $this->assertDatabaseHas('notifications', ['user_id' => $admin->id, 'type' => 'account_deletion']);
            $this->artisan('privacy:retry-erasure')->assertSuccessful();
            Storage::disk('public')->assertExists($photo->path);
            $erasure = AccountErasure::where('user_id', $user->id)->firstOrFail();
            $this->actingAs($admin)->getJson(route('notifications.unread'))->assertOk()->assertJsonFragment(['type' => 'account_deletion']);
            $this->actingAs($admin)->delete(route('admin.account-deletions.destroy', $erasure), ['confirmation' => 'EFFACER'])->assertSessionHasNoErrors();
            Storage::disk('public')->assertMissing($photo->path);
            $this->assertDatabaseHas('account_erasures', ['user_id' => $user->id, 'status' => 'completed', 'approved_by' => $admin->id]);
            $this->assertStringNotContainsString($user->pseudo, json_encode(\App\Models\Notification::where('type', 'account_deletion')->get()->toArray()));
        }
    }

    public function test_erasure_cleans_unflagged_ephemeral_but_preserves_flagged_evidence(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $user = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        $conversation = Conversation::create(['user1_id' => $user->id, 'user2_id' => $other->id]);
        $normal = EphemeralMedia::factory()->create(['conversation_id' => $conversation->id, 'sender_id' => $user->id, 'recipient_id' => $other->id]);
        $proof = EphemeralMedia::factory()->flagged()->create(['conversation_id' => $conversation->id, 'sender_id' => $user->id, 'recipient_id' => $other->id]);
        Storage::disk('local')->put($normal->path, 'synthetic file');
        Storage::disk('local')->put($proof->path, 'synthetic evidence');
        Report::factory()->create(['reporter_id' => $other->id, 'reported_user_id' => $user->id, 'ephemeral_media_id' => $proof->id]);
        $this->actingAs($user)->delete(route('settings.delete-account'), ['confirmation' => 'SUPPRIMER'])->assertSessionHasNoErrors();
        app(\App\Services\AccountErasureService::class)->erase(User::withTrashed()->findOrFail($user->id), User::factory()->create(['is_admin' => true]));
        Storage::disk('local')->assertMissing($normal->path);
        Storage::disk('local')->assertExists($proof->path);
        $this->assertNotNull($normal->fresh()->purged_at);
        $this->assertNull($proof->fresh()->purged_at);
        $this->assertDatabaseHas('reports', ['reported_user_id' => $user->id, 'ephemeral_media_id' => $proof->id]);
        $this->actingAs($other)->get(route('ephemeral.show', $proof))->assertForbidden();
    }

    public function test_failed_file_deletion_keeps_rows_and_a_visible_retry_request(): void
    {
        $user = User::factory()->communityMember()->create();
        $photo = Photo::factory()->approved()->create(['user_id' => $user->id, 'thumbnail_path' => null]);
        $disk = Mockery::mock();
        $disk->shouldReceive('exists')->with($photo->path)->andReturn(true);
        $disk->shouldReceive('delete')->with($photo->path)->andReturn(false);
        Storage::shouldReceive('disk')->with('public')->andReturn($disk);
        $this->actingAs(User::factory()->create(['is_admin' => true]))->delete(route('admin.users.destroy', $user))->assertSessionHasErrors('erasure');
        $this->assertDatabaseHas('photos', ['id' => $photo->id]);
        $this->assertNotSoftDeleted('users', ['id' => $user->id]);
        $this->assertDatabaseHas('account_erasures', ['user_id' => $user->id, 'status' => 'failed', 'failure_stage' => 'storage']);
        $this->assertFalse($user->fresh()->canUseCommunity());
    }

    public function test_billing_failure_preserves_subscription_and_can_be_retried(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $user = User::factory()->communityMember()->create();
        $subscription = Subscription::factory()->create(['user_id' => $user->id, 'status' => 'active', 'stripe_subscription_id' => 'sub_erasure_synthetic']);
        $this->mock(StripePaymentService::class, fn ($mock) => $mock->shouldReceive('cancelSubscription')->once()->with('sub_erasure_synthetic')->andThrow(new \RuntimeException('synthetic billing failure')));
        $this->actingAs($user)->delete(route('settings.delete-account'), ['confirmation' => 'SUPPRIMER'])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('subscriptions', ['id' => $subscription->id]);
        $this->assertDatabaseHas('account_erasures', ['user_id' => $user->id, 'failure_stage' => 'billing']);
        $this->assertSoftDeleted('users', ['id' => $user->id]);
        $this->travel(6)->minutes();
        $this->mock(StripePaymentService::class, fn ($mock) => $mock->shouldReceive('cancelSubscription')->once()->with('sub_erasure_synthetic'));
        $this->artisan('privacy:retry-erasure')->assertSuccessful();
        $this->assertSoftDeleted('users', ['id' => $user->id]);
        $this->assertDatabaseHas('subscriptions', ['id' => $subscription->id, 'status' => 'canceled']);
        $this->assertSame('awaiting_admin', AccountErasure::where('user_id', $user->id)->firstOrFail()->status);
    }

    public function test_other_device_sessions_and_push_tokens_are_revoked(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $user = User::factory()->communityMember()->create();
        DB::table('sessions')->insert(['id' => 'synthetic-other-session', 'user_id' => $user->id, 'payload' => '', 'last_activity' => time()]);
        DB::table('push_subscriptions')->insert(['user_id' => $user->id, 'endpoint' => 'https://push.example.invalid/synthetic', 'p256dh_key' => 'synthetic', 'auth_token' => 'synthetic', 'content_encoding' => 'aesgcm', 'created_at' => now(), 'updated_at' => now()]);
        $this->actingAs($user)->delete(route('settings.delete-account'), ['confirmation' => 'SUPPRIMER'])->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('sessions', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('push_subscriptions', ['user_id' => $user->id]);
    }

    public function test_admin_erasure_uses_the_same_storage_and_anonymization_service(): void
    {
        Storage::fake('local');
        Storage::fake('public');
        $user = User::factory()->communityMember()->create();
        $photo = Photo::factory()->approved()->create(['user_id' => $user->id, 'media_type' => 'video', 'path' => 'videos/synthetic.mp4', 'thumbnail_path' => 'videos/synthetic.jpg']);
        Storage::disk('local')->put($photo->path, 'synthetic video');
        Storage::disk('local')->put($photo->thumbnail_path, 'synthetic poster');
        $this->actingAs(User::factory()->create(['is_admin' => true]))->delete(route('admin.users.destroy', $user))->assertSessionHasNoErrors()->assertRedirect();
        Storage::disk('local')->assertMissing([$photo->path, $photo->thumbnail_path]);
        $this->assertSame('Utilisateur supprimé', User::withTrashed()->findOrFail($user->id)->name);
    }
}
