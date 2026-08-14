<?php

namespace Tests\Unit\Services;

use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected NotificationService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new NotificationService;
    }

    // --- notifyLike ---

    public function test_notify_like_creates_notification(): void
    {
        $user = User::factory()->create();
        $liker = User::factory()->create();

        $this->service->notifyLike($user->id, $liker->id);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user->id,
            'type' => 'like',
        ]);
    }

    public function test_notify_like_stores_liker_id(): void
    {
        $user = User::factory()->create();
        $liker = User::factory()->create();

        $this->service->notifyLike($user->id, $liker->id);

        $notification = Notification::where('user_id', $user->id)->first();
        $this->assertEquals($liker->id, $notification->data['liker_id']);
    }

    // --- notifyMatch ---

    public function test_notify_match_creates_two_notifications(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $this->service->notifyMatch($user1->id, $user2->id);

        $this->assertEquals(2, Notification::where('type', 'match')->count());
    }

    public function test_notify_match_notifies_both_users(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $this->service->notifyMatch($user1->id, $user2->id);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $user1->id,
            'type' => 'match',
        ]);
        $this->assertDatabaseHas('notifications', [
            'user_id' => $user2->id,
            'type' => 'match',
        ]);
    }

    // --- notifyMessage ---

    public function test_notify_message_creates_notification(): void
    {
        $user = User::factory()->create();
        $sender = User::factory()->create();

        $this->service->notifyMessage($user->id, $sender->id, 'Hello!');

        $notification = Notification::where('user_id', $user->id)->first();
        $this->assertEquals('message', $notification->type);
        $this->assertEquals('Hello!', $notification->data['preview']);
        $this->assertEquals($sender->id, $notification->data['sender_id']);
    }

    // --- notifyProfileView ---

    public function test_notify_profile_view_premium_only(): void
    {
        $premiumUser = User::factory()->create(['is_premium' => true, 'premium_expires_at' => now()->addMonth()]);
        $viewer = User::factory()->create();

        $this->service->notifyProfileView($premiumUser->id, $viewer->id);

        $this->assertDatabaseHas('notifications', [
            'user_id' => $premiumUser->id,
            'type' => 'view',
        ]);
    }

    public function test_notify_profile_view_non_premium_not_created(): void
    {
        $freeUser = User::factory()->create(['is_premium' => false]);
        $viewer = User::factory()->create();

        $this->service->notifyProfileView($freeUser->id, $viewer->id);

        $this->assertEquals(0, Notification::where('user_id', $freeUser->id)->count());
    }

    // --- notifyGift ---

    public function test_notify_gift_creates_notification(): void
    {
        $user = User::factory()->create();
        $sender = User::factory()->create();

        $this->service->notifyGift($user->id, $sender->id, 'Rose');

        $notification = Notification::where('user_id', $user->id)->first();
        $this->assertEquals('gift', $notification->type);
        $this->assertEquals('Rose', $notification->data['gift_name']);
        $this->assertEquals($sender->id, $notification->data['sender_id']);
    }

    // --- markAllAsRead ---

    public function test_mark_all_as_read(): void
    {
        $user = User::factory()->create();
        Notification::create(['user_id' => $user->id, 'type' => 'like', 'title' => 'Like', 'message' => 'Test', 'data' => ['test' => true]]);
        Notification::create(['user_id' => $user->id, 'type' => 'match', 'title' => 'Match', 'message' => 'Test', 'data' => ['test' => true]]);
        Notification::create(['user_id' => $user->id, 'type' => 'message', 'title' => 'Message', 'message' => 'Test', 'data' => ['test' => true], 'read_at' => now()]);

        $this->service->markAllAsRead($user->id);

        $unread = Notification::where('user_id', $user->id)->whereNull('read_at')->count();
        $this->assertEquals(0, $unread);
    }

    // --- getUnreadCount ---

    public function test_get_unread_count(): void
    {
        $user = User::factory()->create();
        Notification::create(['user_id' => $user->id, 'type' => 'like', 'title' => 'Like', 'message' => 'Test', 'data' => ['test' => true]]);
        Notification::create(['user_id' => $user->id, 'type' => 'match', 'title' => 'Match', 'message' => 'Test', 'data' => ['test' => true]]);
        Notification::create(['user_id' => $user->id, 'type' => 'message', 'title' => 'Message', 'message' => 'Test', 'data' => ['test' => true], 'read_at' => now()]);

        $count = $this->service->getUnreadCount($user->id);

        $this->assertEquals(2, $count);
    }

    public function test_get_unread_count_zero(): void
    {
        $user = User::factory()->create();

        $count = $this->service->getUnreadCount($user->id);

        $this->assertEquals(0, $count);
    }
}
