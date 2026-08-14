<?php

namespace Tests\Feature;

use App\Enums\NotificationFrequency;
use App\Enums\NotificationType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationPreferenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_preferences_screen_can_be_rendered(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('settings.notifications.edit'))
            ->assertOk();
    }

    public function test_a_user_without_preferences_falls_back_to_defaults(): void
    {
        $user = User::factory()->create();

        $this->assertSame(
            NotificationFrequency::Daily,
            $user->notificationFrequency(NotificationType::NewMessage),
        );

        $this->assertSame(
            NotificationFrequency::Weekly,
            $user->notificationFrequency(NotificationType::NewMembers),
        );
    }

    public function test_preferences_can_be_updated(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->put(route('settings.notifications.update'), [
                'preferences' => [
                    NotificationType::NewMessage->value => NotificationFrequency::Immediate->value,
                    NotificationType::LikeReceived->value => NotificationFrequency::Never->value,
                ],
            ])
            ->assertRedirect(route('settings.notifications.edit'));

        $this->assertDatabaseHas('notification_preferences', [
            'user_id' => $user->id,
            'type' => NotificationType::NewMessage->value,
            'frequency' => NotificationFrequency::Immediate->value,
        ]);

        $this->assertSame(
            NotificationFrequency::Never,
            $user->fresh()->notificationFrequency(NotificationType::LikeReceived),
        );
    }

    public function test_updating_a_preference_twice_does_not_duplicate_rows(): void
    {
        $user = User::factory()->create();

        foreach ([NotificationFrequency::Immediate, NotificationFrequency::Never] as $frequency) {
            $this->actingAs($user)
                ->put(route('settings.notifications.update'), [
                    'preferences' => [
                        NotificationType::NewMessage->value => $frequency->value,
                    ],
                ])
                ->assertRedirect();
        }

        $this->assertDatabaseCount('notification_preferences', 1);
    }

    public function test_an_unavailable_frequency_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->put(route('settings.notifications.update'), [
                'preferences' => [
                    // Les nouvelles inscrites ne sont proposées qu'en hebdomadaire.
                    NotificationType::NewMembers->value => NotificationFrequency::Immediate->value,
                ],
            ])
            ->assertSessionHasErrors('preferences.'.NotificationType::NewMembers->value);

        $this->assertDatabaseCount('notification_preferences', 0);
    }

    public function test_an_unknown_notification_type_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->put(route('settings.notifications.update'), [
                'preferences' => [
                    'carrier_pigeon' => NotificationFrequency::Daily->value,
                ],
            ])
            ->assertSessionHasErrors('preferences.carrier_pigeon');

        $this->assertDatabaseCount('notification_preferences', 0);
    }

    public function test_guests_cannot_access_the_preferences(): void
    {
        $this->get(route('settings.notifications.edit'))->assertRedirect(route('login'));
    }
}
