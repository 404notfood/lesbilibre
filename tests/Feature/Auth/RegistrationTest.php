<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get(route('register'));

        $response->assertStatus(200);
    }

    public function test_new_users_can_register()
    {
        $response = $this->post(route('register.store'), [
            'pseudo' => 'test-user',
            'name' => 'Test User',
            'age' => 28,
            'city_name' => 'Paris',
            'city_latitude' => 48.8566,
            'city_longitude' => 2.3522,
            'city_postal_code' => '75001',
            'sexual_orientation' => 'lesbian',
            'interested_in' => 'single_woman',
            'looking_for' => 'relationship',
            'email' => 'test@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
