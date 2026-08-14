<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_with_complete_data(): void
    {
        $response = $this->post('/register', [
            'pseudo' => 'testuser123',
            'name' => 'Marie',
            'age' => 25,
            'city_name' => 'Paris',
            'city_latitude' => 48.8566,
            'city_longitude' => 2.3522,
            'city_postal_code' => '75001',
            'sexual_orientation' => 'lesbian',
            'interested_in' => 'single_woman',
            'looking_for' => 'relationship',
            'email' => 'marie@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertRedirect('/dashboard');

        $this->assertDatabaseHas('users', [
            'pseudo' => 'testuser123',
            'name' => 'Marie',
            'email' => 'marie@example.com',
        ]);

        $user = User::where('email', 'marie@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNotNull($user->profile);
        $this->assertEquals(25, $user->profile->age);
        $this->assertEquals('Paris', $user->profile->city);
    }
}
