<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PasswordConfirmationTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_current_user_can_confirm_their_password_without_a_login_column(): void
    {
        Notification::fake();
        $user = User::factory()->create();
        $this->travelTo(now()->startOfSecond());

        $this->actingAs($user)->postJson(route('password.confirm.store'), ['password' => 'password'])
            ->assertCreated()
            ->assertSessionHas('auth.password_confirmed_at', now()->timestamp);

        Notification::assertNothingSent();
    }

    public function test_a_different_users_password_does_not_confirm_the_current_user(): void
    {
        $user = User::factory()->create();
        User::factory()->create(['password' => 'another-users-password']);

        $this->actingAs($user)->postJson(route('password.confirm.store'), ['password' => 'another-users-password'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password')
            ->assertSessionMissing('auth.password_confirmed_at');
    }

    public function test_a_missing_password_is_rejected_without_a_server_error(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->postJson(route('password.confirm.store'), [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('password')
            ->assertSessionMissing('auth.password_confirmed_at');
    }

    public function test_confirm_password_screen_can_be_rendered()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->get(route('password.confirm'));

        $response->assertStatus(200);

        $response->assertInertia(fn (Assert $page) => $page
            ->component('auth/confirm-password')
        );
    }

    public function test_password_confirmation_requires_authentication()
    {
        $response = $this->get(route('password.confirm'));

        $response->assertRedirect(route('login'));
    }
}
