<?php

namespace Tests\Feature;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Le calcul de distance repose sur acos()/radians(), absents de SQLite :
 * ces tests ne s'exécutent que sur MySQL/MariaDB.
 */
class SearchDistanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        if (DB::connection()->getDriverName() !== 'mysql') {
            $this->markTestSkipped('Le calcul Haversine requiert MySQL.');
        }
    }

    protected function createUserAt(string $city, float $lat, float $lng, bool $verified = true): User
    {
        $user = User::factory()->create([
            'is_verified' => $verified,
            'is_banned' => false,
        ]);

        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => now()->subYears(30),
            'city' => $city,
            'latitude' => $lat,
            'longitude' => $lng,
            'is_discoverable' => true,
        ]);

        return $user;
    }

    public function test_search_returns_profiles_ordered_by_distance(): void
    {
        $me = $this->createUserAt('Le Genest-Saint-Isle', 48.1029, -0.8966);
        $far = $this->createUserAt('Nice', 43.7102, 7.2620);
        $near = $this->createUserAt('Laval', 48.0578, -0.7692);
        $mid = $this->createUserAt('Rennes', 48.1173, -1.6778);

        $response = $this->actingAs($me)
            ->get(route('search', ['sort_by' => 'distance']))
            ->assertOk();

        $results = $response->viewData('page')['props']['results']['data'];
        $ids = array_column($results, 'id');

        $this->assertSame(
            [$near->id, $mid->id, $far->id],
            $ids,
            'Les profils doivent être triés du plus proche au plus lointain.'
        );
    }

    public function test_distance_is_exposed_and_accurate(): void
    {
        $me = $this->createUserAt('Le Genest-Saint-Isle', 48.1029, -0.8966);
        $this->createUserAt('Laval', 48.0578, -0.7692);

        $response = $this->actingAs($me)
            ->get(route('search', ['sort_by' => 'distance']))
            ->assertOk();

        $first = $response->viewData('page')['props']['results']['data'][0];

        $this->assertArrayHasKey('distance', $first);
        $this->assertEqualsWithDelta(10.7, (float) $first['distance'], 1.0);
    }

    public function test_radius_filter_excludes_distant_profiles(): void
    {
        $me = $this->createUserAt('Le Genest-Saint-Isle', 48.1029, -0.8966);
        $near = $this->createUserAt('Laval', 48.0578, -0.7692);
        $this->createUserAt('Nice', 43.7102, 7.2620);

        $response = $this->actingAs($me)
            ->get(route('search', ['distance' => 50]))
            ->assertOk();

        $results = $response->viewData('page')['props']['results']['data'];

        $this->assertCount(1, $results);
        $this->assertSame($near->id, $results[0]['id']);
    }

    public function test_two_profiles_in_the_same_city_yield_a_zero_distance(): void
    {
        $me = $this->createUserAt('Laval', 48.0578, -0.7692);
        $this->createUserAt('Laval', 48.0578, -0.7692);

        $response = $this->actingAs($me)
            ->get(route('search', ['sort_by' => 'distance']))
            ->assertOk();

        $first = $response->viewData('page')['props']['results']['data'][0];

        $this->assertNotNull($first['distance'], 'acos() ne doit pas produire NaN pour deux points identiques.');
        $this->assertEqualsWithDelta(0.0, (float) $first['distance'], 0.01);
    }

    public function test_search_does_not_fail_for_a_user_without_coordinates(): void
    {
        $me = User::factory()->create(['is_verified' => true]);
        Profile::create([
            'user_id' => $me->id,
            'date_of_birth' => now()->subYears(30),
            'city' => 'Paris',
        ]);

        $this->createUserAt('Laval', 48.0578, -0.7692);

        $this->actingAs($me)
            ->get(route('search', ['sort_by' => 'distance', 'distance' => 50]))
            ->assertOk();
    }

    public function test_search_excludes_non_discoverable_profiles(): void
    {
        $me = $this->createUserAt('Le Genest-Saint-Isle', 48.1029, -0.8966);
        $hidden = $this->createUserAt('Laval', 48.0578, -0.7692);
        $hidden->profile->update(['is_discoverable' => false]);

        $response = $this->actingAs($me)
            ->get(route('search'))
            ->assertOk();

        $ids = array_column($response->viewData('page')['props']['results']['data'], 'id');

        $this->assertNotContains($hidden->id, $ids);
    }

    public function test_age_filter_uses_the_full_birth_date(): void
    {
        $me = $this->createUserAt('Le Genest-Saint-Isle', 48.1029, -0.8966);

        // Anniversaire pas encore passé cette année : la personne a encore 29 ans.
        $notYetThirty = User::factory()->create(['is_verified' => true, 'is_banned' => false]);
        Profile::create([
            'user_id' => $notYetThirty->id,
            'date_of_birth' => now()->subYears(30)->addDay(),
            'city' => 'Laval',
            'latitude' => 48.0578,
            'longitude' => -0.7692,
            'is_discoverable' => true,
        ]);

        $response = $this->actingAs($me)
            ->get(route('search', ['min_age' => 30]))
            ->assertOk();

        $ids = array_column($response->viewData('page')['props']['results']['data'], 'id');

        $this->assertNotContains(
            $notYetThirty->id,
            $ids,
            'Une personne de 29 ans ne doit pas remonter dans un filtre min_age=30.'
        );
    }
}
