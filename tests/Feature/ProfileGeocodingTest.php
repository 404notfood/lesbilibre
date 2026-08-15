<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ProfileGeocodingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
    }

    /**
     * @param  array<int, array<string, mixed>>  $communes
     */
    protected function fakeGeoApi(array $communes): void
    {
        Http::fake([
            'geo.api.gouv.fr/*' => Http::response($communes),
        ]);
    }

    public function test_updating_profile_stores_coordinates_sent_by_the_front(): void
    {
        $user = User::factory()->create();
        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(30),
            'city' => 'Paris',
        ]);

        $this->actingAs($user)
            ->put(route('profile.update'), [
                'city' => 'Le Genest-Saint-Isle',
                'postal_code' => '53940',
                'latitude' => 48.1029,
                'longitude' => -0.8966,
                'sexual_orientation' => 'lesbian',
            ])
            ->assertRedirect();

        $profile = $user->fresh()->profile;

        $this->assertSame('Le Genest-Saint-Isle', $profile->city);
        $this->assertEqualsWithDelta(48.1029, (float) $profile->latitude, 0.0001);
        $this->assertEqualsWithDelta(-0.8966, (float) $profile->longitude, 0.0001);
    }

    public function test_updating_profile_geocodes_city_when_coordinates_are_missing(): void
    {
        $this->fakeGeoApi([
            [
                'nom' => 'Laval',
                'code' => '53130',
                'codeDepartement' => '53',
                'codesPostaux' => ['53000'],
                'population' => 49492,
                'centre' => ['type' => 'Point', 'coordinates' => [-0.7692, 48.0578]],
            ],
        ]);

        $user = User::factory()->create();
        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(30),
        ]);

        $this->actingAs($user)
            ->put(route('profile.update'), [
                'city' => 'Laval',
                'sexual_orientation' => 'lesbian',
            ])
            ->assertRedirect();

        $profile = $user->fresh()->profile;

        $this->assertNotNull($profile->latitude, 'Le serveur doit géocoder la ville en secours.');
        $this->assertEqualsWithDelta(48.0578, (float) $profile->latitude, 0.0001);
        $this->assertEqualsWithDelta(-0.7692, (float) $profile->longitude, 0.0001);
        $this->assertSame('53000', $profile->postal_code);
    }

    public function test_profile_update_survives_geocoding_failure(): void
    {
        Http::fake([
            'geo.api.gouv.fr/*' => Http::response([], 500),
        ]);

        $user = User::factory()->create();
        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(30),
        ]);

        $this->actingAs($user)
            ->put(route('profile.update'), [
                'city' => 'Ville Inconnue',
                'sexual_orientation' => 'lesbian',
            ])
            ->assertRedirect();

        $profile = $user->fresh()->profile;

        $this->assertSame('Ville Inconnue', $profile->city);
        $this->assertNull($profile->latitude);
    }
}
