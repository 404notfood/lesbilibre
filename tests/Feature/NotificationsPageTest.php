<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class NotificationsPageTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_sees_their_notifications_with_the_unread_count(): void
    {
        $user = User::factory()->create();

        Notification::createNotification($user->id, 'like', 'Nouveau like', 'Quelqu\'un vous a likée.');
        Notification::createNotification($user->id, 'match', 'Nouveau match', 'C\'est réciproque !');

        $read = Notification::createNotification($user->id, 'message', 'Message', 'Vous avez un message.');
        $read->markAsRead();

        $this->actingAs($user)
            ->get(route('notifications.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Notifications/Index')
                ->has('notifications.data', 3)
                ->where('unreadCount', 2)
            );
    }

    public function test_notifications_of_other_users_are_not_listed(): void
    {
        $user = User::factory()->create();
        $someoneElse = User::factory()->create();

        Notification::createNotification($someoneElse->id, 'like', 'Nouveau like', 'Message.');

        $this->actingAs($user)
            ->get(route('notifications.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->has('notifications.data', 0)
                ->where('unreadCount', 0)
            );
    }

    public function test_user_can_mark_a_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = Notification::createNotification($user->id, 'like', 'Nouveau like', 'Message.');

        $this->actingAs($user)
            ->post(route('notifications.read', $notification))
            ->assertRedirect();

        $notification->refresh();
        $this->assertTrue($notification->is_read);
        $this->assertNotNull($notification->read_at);
    }

    public function test_user_cannot_mark_someone_elses_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = Notification::createNotification(
            User::factory()->create()->id,
            'like',
            'Nouveau like',
            'Message.'
        );

        $this->actingAs($user)
            ->post(route('notifications.read', $notification))
            ->assertForbidden();

        $this->assertFalse($notification->fresh()->is_read);
    }

    public function test_user_can_mark_every_notification_as_read(): void
    {
        $user = User::factory()->create();
        Notification::createNotification($user->id, 'like', 'A', 'Message.');
        Notification::createNotification($user->id, 'match', 'B', 'Message.');

        $this->actingAs($user)
            ->post(route('notifications.markAllAsRead'))
            ->assertRedirect();

        $this->assertSame(0, $user->appNotifications()->where('is_read', false)->count());
    }

    public function test_user_can_delete_their_own_notification(): void
    {
        $user = User::factory()->create();
        $notification = Notification::createNotification($user->id, 'like', 'A', 'Message.');

        $this->actingAs($user)
            ->delete(route('notifications.destroy', $notification))
            ->assertRedirect();

        $this->assertDatabaseMissing('notifications', ['id' => $notification->id]);
    }

    public function test_user_cannot_delete_someone_elses_notification(): void
    {
        $user = User::factory()->create();
        $notification = Notification::createNotification(
            User::factory()->create()->id,
            'like',
            'A',
            'Message.'
        );

        $this->actingAs($user)
            ->delete(route('notifications.destroy', $notification))
            ->assertForbidden();

        $this->assertDatabaseHas('notifications', ['id' => $notification->id]);
    }
}
