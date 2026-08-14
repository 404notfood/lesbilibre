<?php

namespace Tests\Feature\Settings;

use App\Models\BlockedUser;
use App\Models\Conversation;
use App\Models\GemTransaction;
use App\Models\Like;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Photo;
use App\Models\Profile;
use App\Models\Report;
use App\Models\User;
use App\Models\UserMatch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DataPrivacyTest extends TestCase
{
    use RefreshDatabase;

    public function test_privacy_page_requires_authentication(): void
    {
        $response = $this->get(route('settings.privacy'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_export_their_data(): void
    {
        $user = User::factory()->create();

        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => '1995-06-15',
            'city' => 'Paris',
            'bio' => 'Test bio',
        ]);

        $response = $this
            ->actingAs($user)
            ->get(route('settings.data-export'));

        $response->assertOk();
        $response->assertHeader('Content-Disposition');

        $data = $response->json();

        $this->assertArrayHasKey('exported_at', $data);
        $this->assertArrayHasKey('user', $data);
        $this->assertArrayHasKey('profile', $data);
        $this->assertArrayHasKey('photos', $data);
        $this->assertArrayHasKey('messages', $data);
        $this->assertArrayHasKey('likes_given', $data);
        $this->assertArrayHasKey('likes_received', $data);
        $this->assertArrayHasKey('matches', $data);
        $this->assertArrayHasKey('badges', $data);
        $this->assertArrayHasKey('gem_transactions', $data);
        $this->assertArrayHasKey('notifications', $data);
        $this->assertArrayHasKey('blocked_users', $data);
        $this->assertArrayHasKey('reports_made', $data);

        // Profile data should be present
        $this->assertSame('Paris', $data['profile']['city']);
        $this->assertSame('Test bio', $data['profile']['bio']);
    }

    public function test_export_does_not_include_other_users_data(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        // Create a like FROM the other user TO this user
        Like::create(['user_id' => $otherUser->id, 'liked_user_id' => $user->id]);

        $response = $this
            ->actingAs($user)
            ->get(route('settings.data-export'));

        $data = $response->json();

        // likes_given should be empty (we didn't create likes FROM this user)
        $this->assertEmpty($data['likes_given']);

        // likes_received should contain the like from otherUser
        $this->assertCount(1, $data['likes_received']);
    }

    public function test_export_requires_authentication(): void
    {
        $response = $this->get(route('settings.data-export'));

        $response->assertRedirect(route('login'));
    }

    public function test_user_can_update_consent(): void
    {
        $user = User::factory()->create([
            'data_processing_consent' => false,
            'marketing_consent' => false,
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('settings.update-consent'), [
                'data_processing_consent' => true,
                'marketing_consent' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $user->refresh();

        $this->assertTrue($user->data_processing_consent);
        $this->assertTrue($user->marketing_consent);
        $this->assertNotNull($user->data_processing_consented_at);
    }

    public function test_consent_timestamp_is_cleared_when_consent_is_withdrawn(): void
    {
        $user = User::factory()->create([
            'data_processing_consent' => true,
            'data_processing_consented_at' => now(),
            'marketing_consent' => true,
        ]);

        $response = $this
            ->actingAs($user)
            ->post(route('settings.update-consent'), [
                'data_processing_consent' => false,
                'marketing_consent' => false,
            ]);

        $response->assertSessionHasNoErrors();

        $user->refresh();

        $this->assertFalse($user->data_processing_consent);
        $this->assertFalse($user->marketing_consent);
        $this->assertNull($user->data_processing_consented_at);
    }

    public function test_consent_update_requires_valid_data(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->post(route('settings.update-consent'), []);

        $response->assertSessionHasErrors(['data_processing_consent', 'marketing_consent']);
    }

    public function test_user_can_delete_their_account(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => '1995-06-15',
        ]);

        $response = $this
            ->actingAs($user)
            ->delete(route('settings.delete-account'), [
                'confirmation' => 'SUPPRIMER',
            ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect('/');

        $this->assertGuest();

        // User should be soft-deleted
        $this->assertSoftDeleted('users', ['id' => $user->id]);

        // User data should be anonymized
        $deletedUser = User::withTrashed()->find($user->id);
        $this->assertSame("deleted_{$user->id}@deleted.local", $deletedUser->email);
        $this->assertSame('Utilisateur supprimé', $deletedUser->name);
        $this->assertSame("deleted_{$user->id}", $deletedUser->pseudo);
    }

    public function test_delete_account_requires_confirmation_word(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete(route('settings.delete-account'), [
                'confirmation' => 'wrong',
            ]);

        $response->assertSessionHasErrors('confirmation');
        $this->assertNotNull($user->fresh());
    }

    public function test_delete_account_requires_confirmation_field(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete(route('settings.delete-account'), []);

        $response->assertSessionHasErrors('confirmation');
        $this->assertNotNull($user->fresh());
    }

    public function test_delete_account_anonymizes_messages(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $conversation = Conversation::create([
            'user1_id' => $user->id,
            'user2_id' => $otherUser->id,
            'last_message_at' => now(),
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'content' => 'Hello, this is a private message',
        ]);

        $this
            ->actingAs($user)
            ->delete(route('settings.delete-account'), [
                'confirmation' => 'SUPPRIMER',
            ]);

        $message->refresh();
        $this->assertSame('[message supprimé]', $message->content);
    }

    public function test_delete_account_removes_photos_from_storage(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        Storage::disk('public')->put('photos/test-photo.jpg', 'fake content');

        Photo::create([
            'user_id' => $user->id,
            'path' => 'photos/test-photo.jpg',
            'is_primary' => true,
            'is_approved' => true,
            'order' => 0,
        ]);

        $this
            ->actingAs($user)
            ->delete(route('settings.delete-account'), [
                'confirmation' => 'SUPPRIMER',
            ]);

        Storage::disk('public')->assertMissing('photos/test-photo.jpg');
        $this->assertDatabaseMissing('photos', ['user_id' => $user->id]);
    }

    public function test_delete_account_removes_likes_and_matches(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Like::create(['user_id' => $user->id, 'liked_user_id' => $otherUser->id]);
        Like::create(['user_id' => $otherUser->id, 'liked_user_id' => $user->id]);
        UserMatch::create(['user1_id' => $user->id, 'user2_id' => $otherUser->id, 'matched_at' => now()]);

        $this
            ->actingAs($user)
            ->delete(route('settings.delete-account'), [
                'confirmation' => 'SUPPRIMER',
            ]);

        $this->assertDatabaseMissing('likes', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('likes', ['liked_user_id' => $user->id]);
        $this->assertDatabaseMissing('user_matches', ['user1_id' => $user->id]);
    }

    public function test_delete_account_removes_blocked_users(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        BlockedUser::create(['blocker_id' => $user->id, 'blocked_id' => $otherUser->id]);

        $this
            ->actingAs($user)
            ->delete(route('settings.delete-account'), [
                'confirmation' => 'SUPPRIMER',
            ]);

        $this->assertDatabaseMissing('blocked_users', ['blocker_id' => $user->id]);
    }

    public function test_delete_account_removes_notifications_and_transactions(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();

        Notification::create([
            'user_id' => $user->id,
            'type' => 'test',
            'title' => 'Test',
            'message' => 'Test notification',
        ]);

        GemTransaction::create([
            'user_id' => $user->id,
            'type' => 'purchase',
            'amount' => 100,
            'balance_after' => 100,
        ]);

        $this
            ->actingAs($user)
            ->delete(route('settings.delete-account'), [
                'confirmation' => 'SUPPRIMER',
            ]);

        $this->assertDatabaseMissing('notifications', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('gem_transactions', ['user_id' => $user->id]);
    }

    public function test_delete_account_removes_reports_made_by_user(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Report::create([
            'reporter_id' => $user->id,
            'reported_user_id' => $otherUser->id,
            'reason' => 'spam',
            'description' => 'This user is spamming.',
        ]);

        $this
            ->actingAs($user)
            ->delete(route('settings.delete-account'), [
                'confirmation' => 'SUPPRIMER',
            ]);

        $this->assertDatabaseMissing('reports', ['reporter_id' => $user->id]);
    }
}
