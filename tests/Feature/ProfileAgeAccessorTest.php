<?php

namespace Tests\Feature;

use App\Models\Like;
use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileAgeAccessorTest extends TestCase
{
    use RefreshDatabase;

    public function test_age_is_computed_from_the_birth_date(): void
    {
        $profile = Profile::create([
            'user_id' => User::factory()->create()->id,
            'date_of_birth' => now()->subYears(32)->subDay(),
        ]);

        $this->assertSame(32, $profile->age);
    }

    public function test_age_does_not_fail_when_the_birth_date_is_not_loaded(): void
    {
        $user = User::factory()->create();
        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(28),
            'age' => 28,
        ]);

        // Select partiel : `date_of_birth` est absente du modèle hydraté.
        $partial = Profile::query()
            ->select('user_id', 'age')
            ->where('user_id', $user->id)
            ->first();

        $this->assertSame(28, $partial->age, 'L\'accesseur doit retomber sur la colonne `age`.');
    }

    public function test_age_is_null_when_no_source_is_available(): void
    {
        $user = User::factory()->create();
        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(25),
        ]);

        // Ni `date_of_birth` ni `age` ne sont hydratés.
        $partial = Profile::query()
            ->select('user_id')
            ->where('user_id', $user->id)
            ->first();

        $this->assertNull($partial->age);
    }

    public function test_dashboard_renders_when_the_last_liker_profile_is_partially_loaded(): void
    {
        $me = User::factory()->create();
        Profile::create([
            'user_id' => $me->id,
            'date_of_birth' => now()->subYears(30),
        ]);

        $liker = User::factory()->create(['is_verified' => true, 'is_banned' => false]);
        Profile::create([
            'user_id' => $liker->id,
            'date_of_birth' => now()->subYears(26),
            'age' => 26,
        ]);

        Like::create([
            'user_id' => $liker->id,
            'liked_user_id' => $me->id,
        ]);

        $response = $this->actingAs($me)->get(route('dashboard'))->assertOk();

        $lastLike = $response->viewData('page')['props']['liveSignals']['last_like'];

        $this->assertNotNull($lastLike);
        $this->assertSame(26, $lastLike['age']);
    }
}
