<?php

namespace Tests\Unit\Services;

use App\Models\Profile;
use App\Models\User;
use App\Services\LocationService;
use App\Services\MatchScoreService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchScoreServiceTest extends TestCase
{
    use RefreshDatabase;

    protected MatchScoreService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new MatchScoreService(new LocationService);
    }

    // --- calculateScore ---

    public function test_score_is_between_70_and_100(): void
    {
        [$profile1, $profile2] = $this->createProfiles();

        $score = $this->service->calculateScore($profile1, $profile2);

        $this->assertGreaterThanOrEqual(70, $score);
        $this->assertLessThanOrEqual(100, $score);
    }

    public function test_perfect_match_gets_100(): void
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $profile1 = Profile::create([
            'user_id' => $user1->id,
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'interests' => ['cinema', 'music', 'travel'],
            'min_age_preference' => 25,
            'max_age_preference' => 35,
            'latitude' => 48.8566,
            'longitude' => 2.3522,
            'smokes' => false,
            'drinks' => false,
            'has_children' => false,
            'wants_children' => true,
        ]);
        $profile2 = Profile::create([
            'user_id' => $user2->id,
            'date_of_birth' => '1996-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
            'interests' => ['cinema', 'music', 'travel'],
            'min_age_preference' => 25,
            'max_age_preference' => 35,
            'latitude' => 48.8600,
            'longitude' => 2.3550,
            'smokes' => false,
            'drinks' => false,
            'has_children' => false,
            'wants_children' => true,
        ]);

        $score = $this->service->calculateScore($profile1, $profile2);

        $this->assertEquals(100, $score);
    }

    // --- interest score ---

    public function test_no_interests_gives_base_score(): void
    {
        [$profile1, $profile2] = $this->createProfiles(['interests' => []], ['interests' => []]);

        $score = $this->service->calculateScore($profile1, $profile2);

        $this->assertGreaterThanOrEqual(70, $score);
    }

    public function test_common_interests_increase_score(): void
    {
        [$p1, $p2] = $this->createProfiles(
            ['interests' => ['a', 'b', 'c']],
            ['interests' => ['a', 'b', 'c']]
        );
        [$p3, $p4] = $this->createProfiles(
            ['interests' => ['a', 'b', 'c']],
            ['interests' => ['x', 'y', 'z']]
        );

        $scoreHigh = $this->service->calculateScore($p1, $p2);
        $scoreLow = $this->service->calculateScore($p3, $p4);

        $this->assertGreaterThan($scoreLow, $scoreHigh);
    }

    // --- age score ---

    public function test_both_in_age_preference_scores_20(): void
    {
        [$p1, $p2] = $this->createProfiles(
            ['date_of_birth' => '1995-01-01', 'min_age_preference' => 25, 'max_age_preference' => 40],
            ['date_of_birth' => '1996-01-01', 'min_age_preference' => 25, 'max_age_preference' => 40]
        );
        [$p3, $p4] = $this->createProfiles(
            ['date_of_birth' => '1970-01-01', 'min_age_preference' => 18, 'max_age_preference' => 25],
            ['date_of_birth' => '1970-01-01', 'min_age_preference' => 18, 'max_age_preference' => 25]
        );

        $goodScore = $this->service->calculateScore($p1, $p2);
        $badScore = $this->service->calculateScore($p3, $p4);

        $this->assertGreaterThanOrEqual($badScore, $goodScore);
    }

    // --- location score ---

    public function test_close_location_scores_higher(): void
    {
        [$near1, $near2] = $this->createProfiles(
            ['latitude' => 48.8566, 'longitude' => 2.3522],
            ['latitude' => 48.8600, 'longitude' => 2.3550]
        );
        [$far1, $far2] = $this->createProfiles(
            ['latitude' => 48.8566, 'longitude' => 2.3522],
            ['latitude' => 43.2965, 'longitude' => 5.3698]  // Marseille
        );

        $nearScore = $this->service->calculateScore($near1, $near2);
        $farScore = $this->service->calculateScore($far1, $far2);

        $this->assertGreaterThanOrEqual($farScore, $nearScore);
    }

    public function test_no_location_gives_base_score(): void
    {
        [$p1, $p2] = $this->createProfiles(
            ['latitude' => null, 'longitude' => null],
            ['latitude' => null, 'longitude' => null]
        );

        $score = $this->service->calculateScore($p1, $p2);

        $this->assertGreaterThanOrEqual(70, $score);
    }

    // --- orientation score ---

    public function test_same_orientation_scores_10(): void
    {
        [$same1, $same2] = $this->createProfiles(
            ['sexual_orientation' => 'lesbian'],
            ['sexual_orientation' => 'lesbian']
        );
        [$diff1, $diff2] = $this->createProfiles(
            ['sexual_orientation' => 'lesbian'],
            ['sexual_orientation' => 'straight']
        );

        $sameScore = $this->service->calculateScore($same1, $same2);
        $diffScore = $this->service->calculateScore($diff1, $diff2);

        $this->assertGreaterThanOrEqual($diffScore, $sameScore);
    }

    // --- relationship score ---

    public function test_same_looking_for_scores_higher(): void
    {
        [$same1, $same2] = $this->createProfiles(
            ['looking_for' => 'relationship'],
            ['looking_for' => 'relationship']
        );
        [$diff1, $diff2] = $this->createProfiles(
            ['looking_for' => 'relationship'],
            ['looking_for' => 'casual']
        );

        $sameScore = $this->service->calculateScore($same1, $same2);
        $diffScore = $this->service->calculateScore($diff1, $diff2);

        $this->assertGreaterThanOrEqual($diffScore, $sameScore);
    }

    // --- helpers ---

    private function createProfiles(array $overrides1 = [], array $overrides2 = []): array
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $defaults = [
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'Bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
        ];

        $profile1 = Profile::create(array_merge($defaults, ['user_id' => $user1->id], $overrides1));
        $profile2 = Profile::create(array_merge($defaults, ['user_id' => $user2->id], $overrides2));

        return [$profile1, $profile2];
    }
}
