<?php

namespace Tests\Unit\Services;

use App\Models\Profile;
use App\Models\User;
use App\Services\CompatibilityService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CompatibilityServiceTest extends TestCase
{
    use RefreshDatabase;

    protected CompatibilityService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new CompatibilityService;
    }

    // --- calculateScore ---

    public function test_calculate_score_returns_0_to_100(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Profile::create([
            'user_id' => $user1->id,
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'Bio 1',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'interests' => ['cinema', 'music'],
            'min_age_preference' => 20,
            'max_age_preference' => 40,
        ]);
        Profile::create([
            'user_id' => $user2->id,
            'date_of_birth' => '1997-01-01',
            'city' => 'Paris',
            'bio' => 'Bio 2',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'interests' => ['cinema', 'travel'],
            'min_age_preference' => 20,
            'max_age_preference' => 40,
        ]);

        $score = $this->service->calculateScore($user1, $user2);

        $this->assertGreaterThanOrEqual(0, $score);
        $this->assertLessThanOrEqual(100, $score);
    }

    public function test_calculate_score_with_no_profile_returns_0(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $score = $this->service->calculateScore($user1, $user2);

        $this->assertEquals(0, $score);
    }

    public function test_calculate_score_one_missing_profile_returns_0(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Profile::create([
            'user_id' => $user1->id,
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
        ]);

        $score = $this->service->calculateScore($user1, $user2);

        $this->assertEquals(0, $score);
    }

    // --- orientation compatibility ---

    public function test_lesbian_lesbian_compatible(): void
    {
        [$user1, $user2] = $this->createUsersWithOrientation('lesbian', 'lesbian');

        $score = $this->service->calculateScore($user1, $user2);

        // Should include 20 points for orientation
        $this->assertGreaterThan(0, $score);
    }

    public function test_lesbian_bisexual_compatible(): void
    {
        [$user1, $user2] = $this->createUsersWithOrientation('lesbian', 'bisexual');

        $score = $this->service->calculateScore($user1, $user2);

        $this->assertGreaterThan(0, $score);
    }

    public function test_lesbian_queer_compatible(): void
    {
        [$user1, $user2] = $this->createUsersWithOrientation('lesbian', 'queer');

        $score = $this->service->calculateScore($user1, $user2);

        $this->assertGreaterThan(0, $score);
    }

    // --- age compatibility ---

    public function test_both_in_age_range_scores_higher(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Profile::create([
            'user_id' => $user1->id,
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'min_age_preference' => 25,
            'max_age_preference' => 35,
        ]);
        Profile::create([
            'user_id' => $user2->id,
            'date_of_birth' => '1996-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'min_age_preference' => 25,
            'max_age_preference' => 35,
        ]);

        $score = $this->service->calculateScore($user1, $user2);

        $this->assertGreaterThan(30, $score);
    }

    // --- distance compatibility ---

    public function test_same_city_scores_higher(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Profile::create([
            'user_id' => $user1->id,
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'latitude' => 48.8566,
            'longitude' => 2.3522,
            'search_radius' => 50,
        ]);
        Profile::create([
            'user_id' => $user2->id,
            'date_of_birth' => '1996-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'latitude' => 48.8600,
            'longitude' => 2.3550,
            'search_radius' => 50,
        ]);

        $score = $this->service->calculateScore($user1, $user2);

        $this->assertGreaterThan(40, $score);
    }

    public function test_no_location_gives_neutral_score(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Profile::create([
            'user_id' => $user1->id,
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'latitude' => null,
            'longitude' => null,
        ]);
        Profile::create([
            'user_id' => $user2->id,
            'date_of_birth' => '1996-01-01',
            'city' => 'Lyon',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'latitude' => null,
            'longitude' => null,
        ]);

        $score = $this->service->calculateScore($user1, $user2);

        // Should still get some score (neutral distance = 0.5)
        $this->assertGreaterThan(0, $score);
    }

    // --- interests compatibility ---

    public function test_common_interests_increase_score(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Profile::create([
            'user_id' => $user1->id,
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'interests' => ['cinema', 'music', 'travel', 'cooking'],
        ]);
        Profile::create([
            'user_id' => $user2->id,
            'date_of_birth' => '1996-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'interests' => ['cinema', 'music', 'travel', 'cooking'],
        ]);

        $score = $this->service->calculateScore($user1, $user2);

        // 100% interests overlap should give high score
        $this->assertGreaterThan(50, $score);
    }

    // --- lifestyle compatibility ---

    public function test_matching_lifestyle_increases_score(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Profile::create([
            'user_id' => $user1->id,
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'has_children' => false,
            'wants_children' => true,
            'smokes' => false,
            'drinks' => false,
        ]);
        Profile::create([
            'user_id' => $user2->id,
            'date_of_birth' => '1996-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'has_children' => false,
            'wants_children' => true,
            'smokes' => false,
            'drinks' => false,
        ]);

        $score = $this->service->calculateScore($user1, $user2);

        $this->assertGreaterThan(50, $score);
    }

    // --- getCompatibilityCategory ---

    public function test_category_excellent(): void
    {
        $result = $this->service->getCompatibilityCategory(85);

        $this->assertEquals('excellent', $result['level']);
    }

    public function test_category_good(): void
    {
        $result = $this->service->getCompatibilityCategory(65);

        $this->assertEquals('good', $result['level']);
    }

    public function test_category_medium(): void
    {
        $result = $this->service->getCompatibilityCategory(45);

        $this->assertEquals('medium', $result['level']);
    }

    public function test_category_low(): void
    {
        $result = $this->service->getCompatibilityCategory(25);

        $this->assertEquals('low', $result['level']);
    }

    public function test_category_minimal(): void
    {
        $result = $this->service->getCompatibilityCategory(10);

        $this->assertEquals('minimal', $result['level']);
    }

    public function test_category_boundary_80_is_excellent(): void
    {
        $result = $this->service->getCompatibilityCategory(80);

        $this->assertEquals('excellent', $result['level']);
    }

    public function test_category_includes_label_and_color(): void
    {
        $result = $this->service->getCompatibilityCategory(90);

        $this->assertArrayHasKey('label', $result);
        $this->assertArrayHasKey('color', $result);
        $this->assertArrayHasKey('emoji', $result);
    }

    // --- helpers ---

    private function createUsersWithOrientation(string $orientation1, string $orientation2): array
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        Profile::create([
            'user_id' => $user1->id,
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => $orientation1,
            'looking_for' => 'relationship',
        ]);
        Profile::create([
            'user_id' => $user2->id,
            'date_of_birth' => '1996-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => $orientation2,
            'looking_for' => 'relationship',
        ]);

        return [$user1, $user2];
    }
}
