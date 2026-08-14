<?php

namespace Tests\Unit\Services;

use App\Models\Photo;
use App\Models\Profile;
use App\Models\Report;
use App\Models\TrustScoreLog;
use App\Models\User;
use App\Services\TrustScoreService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrustScoreServiceTest extends TestCase
{
    use RefreshDatabase;

    protected TrustScoreService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new TrustScoreService;
    }

    // --- calculateScore ---

    public function test_verified_user_gets_25_points(): void
    {
        $user = User::factory()->create([
            'is_verified' => true,
            'is_premium' => false,
            'created_at' => now(),
        ]);

        $score = $this->service->calculateScore($user);

        $this->assertGreaterThanOrEqual(25, $score);
    }

    public function test_unverified_user_gets_no_verification_points(): void
    {
        $user = User::factory()->create([
            'is_verified' => false,
            'is_premium' => false,
            'created_at' => now(),
        ]);

        $score = $this->service->calculateScore($user);

        $this->assertLessThan(25, $score);
    }

    public function test_account_age_1_per_month_max_15(): void
    {
        $user = User::factory()->create([
            'is_verified' => false,
            'is_premium' => false,
            'created_at' => now()->subMonths(20),
        ]);

        $score = $this->service->calculateScore($user);

        // Max 15 for account age, no verification, no premium
        $this->assertEquals(15, $score);
    }

    public function test_profile_completion_adds_10(): void
    {
        $user = User::factory()->create([
            'is_verified' => false,
            'is_premium' => false,
            'created_at' => now(),
        ]);
        Profile::create([
            'user_id' => $user->id,
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'bio' => 'My bio',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
        ]);
        Photo::create([
            'user_id' => $user->id,
            'path' => 'photos/test.jpg',
            'is_approved' => true,
            'is_primary' => true,
        ]);

        $score = $this->service->calculateScore($user);

        // 10 (profile) + 1 (photo) = 11
        $this->assertEquals(11, $score);
    }

    public function test_approved_photos_1_each_max_10(): void
    {
        $user = User::factory()->create([
            'is_verified' => false,
            'is_premium' => false,
            'created_at' => now(),
        ]);
        for ($i = 0; $i < 15; $i++) {
            Photo::create([
                'user_id' => $user->id,
                'path' => "photos/test{$i}.jpg",
                'is_approved' => true,
                'is_primary' => $i === 0,
            ]);
        }

        $score = $this->service->calculateScore($user);

        // Max 10 for photos
        $this->assertEquals(10, $score);
    }

    public function test_premium_status_adds_5(): void
    {
        $user = User::factory()->create([
            'is_verified' => false,
            'is_premium' => true,
            'premium_expires_at' => now()->addMonth(),
            'created_at' => now(),
        ]);

        $score = $this->service->calculateScore($user);

        $this->assertEquals(5, $score);
    }

    public function test_score_clamps_to_0_minimum(): void
    {
        $user = User::factory()->create([
            'is_verified' => false,
            'is_premium' => false,
            'created_at' => now(),
        ]);

        // Create many reports to push score negative
        $reporter = User::factory()->create();
        for ($i = 0; $i < 10; $i++) {
            Report::create([
                'reporter_id' => $reporter->id,
                'reported_user_id' => $user->id,
                'reason' => 'spam',
                'status' => 'pending',
                'description' => 'Test report',
            ]);
        }

        $score = $this->service->calculateScore($user);

        $this->assertEquals(0, $score);
    }

    public function test_reports_deduct_5_each_within_90_days(): void
    {
        $user = User::factory()->create([
            'is_verified' => true,
            'is_premium' => false,
            'created_at' => now(),
        ]);

        $reporter = User::factory()->create();
        Report::create([
            'reporter_id' => $reporter->id,
            'reported_user_id' => $user->id,
            'reason' => 'spam',
            'status' => 'pending',
            'description' => 'Recent report',
        ]);

        $score = $this->service->calculateScore($user);

        // 25 (verified) - 5 (report) = 20
        $this->assertEquals(20, $score);
    }

    // --- getTrustLevel ---

    public function test_trust_level_excellence(): void
    {
        $result = $this->service->getTrustLevel(80);

        $this->assertEquals('excellence', $result['level']);
    }

    public function test_trust_level_very_trusted(): void
    {
        $result = $this->service->getTrustLevel(60);

        $this->assertEquals('very_trusted', $result['level']);
    }

    public function test_trust_level_trusted(): void
    {
        $result = $this->service->getTrustLevel(30);

        $this->assertEquals('trusted', $result['level']);
    }

    public function test_trust_level_new(): void
    {
        $result = $this->service->getTrustLevel(10);

        $this->assertEquals('new', $result['level']);
    }

    public function test_trust_level_boundary_76_is_excellence(): void
    {
        $result = $this->service->getTrustLevel(76);

        $this->assertEquals('excellence', $result['level']);
    }

    public function test_trust_level_boundary_75_is_very_trusted(): void
    {
        $result = $this->service->getTrustLevel(75);

        $this->assertEquals('very_trusted', $result['level']);
    }

    // --- refreshScore ---

    public function test_refresh_score_updates_user(): void
    {
        $user = User::factory()->create([
            'is_verified' => true,
            'is_premium' => false,
            'trust_score' => 0,
            'created_at' => now(),
        ]);

        $this->service->refreshScore($user);

        $user->refresh();
        $this->assertEquals(25, $user->trust_score);
    }

    public function test_refresh_score_creates_log(): void
    {
        $user = User::factory()->create([
            'is_verified' => true,
            'is_premium' => false,
            'trust_score' => 0,
            'created_at' => now(),
        ]);

        $this->service->refreshScore($user);

        $this->assertDatabaseHas('trust_score_logs', [
            'user_id' => $user->id,
            'previous_score' => 0,
            'new_score' => 25,
        ]);
    }

    public function test_refresh_score_skips_when_no_change(): void
    {
        $user = User::factory()->create([
            'is_verified' => true,
            'is_premium' => false,
            'trust_score' => 25,
            'created_at' => now(),
        ]);

        $this->service->refreshScore($user);

        $this->assertEquals(0, TrustScoreLog::count());
    }

    // --- getBreakdown ---

    public function test_get_breakdown_returns_all_categories(): void
    {
        $user = User::factory()->create([
            'is_verified' => false,
            'is_premium' => false,
            'created_at' => now(),
        ]);

        $breakdown = $this->service->getBreakdown($user);

        $categories = array_column($breakdown, 'category');
        $this->assertContains('Verification', $categories);
        $this->assertContains('Anciennete', $categories);
        $this->assertContains('Profil', $categories);
        $this->assertContains('Photos', $categories);
        $this->assertContains('Signalements', $categories);
        $this->assertContains('Premium', $categories);
        $this->assertContains('Badges', $categories);
    }
}
