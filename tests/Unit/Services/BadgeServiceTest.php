<?php

namespace Tests\Unit\Services;

use App\Models\Badge;
use App\Models\Photo;
use App\Models\Profile;
use App\Models\User;
use App\Services\BadgeService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BadgeServiceTest extends TestCase
{
    use RefreshDatabase;

    protected BadgeService $badgeService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->badgeService = new BadgeService;
    }

    // --- shouldAwardBadge ---

    public function test_should_award_badge_prevents_duplicate(): void
    {
        $user = User::factory()->create(['is_verified' => true]);
        $badge = Badge::create([
            'slug' => 'verified',
            'name' => 'Verified',
            'description' => 'Test',
            'icon' => 'check',
            'color' => '#fff',
            'criteria' => ['type' => 'verified_profile'],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->badgeService->awardBadge($user, $badge);

        $this->assertFalse($this->badgeService->shouldAwardBadge($user, $badge));
    }

    public function test_should_award_badge_no_criteria_returns_false(): void
    {
        $user = User::factory()->create();
        $badge = Badge::create([
            'slug' => 'empty',
            'name' => 'Empty',
            'description' => 'Test',
            'icon' => 'star',
            'color' => '#fff',
            'criteria' => null,
            'points' => 0,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->assertFalse($this->badgeService->shouldAwardBadge($user, $badge));
    }

    // --- criteria checks ---

    public function test_criteria_verified_profile(): void
    {
        $user = User::factory()->create(['is_verified' => true]);
        $badge = Badge::create([
            'slug' => 'verified',
            'name' => 'Verified',
            'description' => 'Test',
            'icon' => 'check',
            'color' => '#fff',
            'criteria' => ['type' => 'verified_profile'],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->assertTrue($this->badgeService->shouldAwardBadge($user, $badge));
    }

    public function test_criteria_verified_profile_fails_when_not_verified(): void
    {
        $user = User::factory()->create(['is_verified' => false]);
        $badge = Badge::create([
            'slug' => 'verified',
            'name' => 'Verified',
            'description' => 'Test',
            'icon' => 'check',
            'color' => '#fff',
            'criteria' => ['type' => 'verified_profile'],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->assertFalse($this->badgeService->shouldAwardBadge($user, $badge));
    }

    public function test_criteria_premium_user(): void
    {
        $user = User::factory()->create(['is_premium' => true]);
        $badge = Badge::create([
            'slug' => 'premium',
            'name' => 'Premium',
            'description' => 'Test',
            'icon' => 'star',
            'color' => '#gold',
            'criteria' => ['type' => 'premium_user'],
            'points' => 5,
            'rarity' => 'rare',
            'is_active' => true,
        ]);

        $this->assertTrue($this->badgeService->shouldAwardBadge($user, $badge));
    }

    public function test_criteria_photos_count(): void
    {
        $user = User::factory()->create();
        for ($i = 0; $i < 3; $i++) {
            Photo::create([
                'user_id' => $user->id,
                'path' => "photos/test{$i}.jpg",
                'is_approved' => true,
                'is_primary' => $i === 0,
            ]);
        }

        $badge = Badge::create([
            'slug' => 'photographer',
            'name' => 'Photographer',
            'description' => 'Upload 3 photos',
            'icon' => 'camera',
            'color' => '#fff',
            'criteria' => ['type' => 'photos_count', 'target' => 3],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->assertTrue($this->badgeService->shouldAwardBadge($user, $badge));
    }

    public function test_criteria_photos_count_not_enough(): void
    {
        $user = User::factory()->create();
        Photo::create([
            'user_id' => $user->id,
            'path' => 'photos/test.jpg',
            'is_approved' => true,
            'is_primary' => true,
        ]);

        $badge = Badge::create([
            'slug' => 'photographer',
            'name' => 'Photographer',
            'description' => 'Upload 5 photos',
            'icon' => 'camera',
            'color' => '#fff',
            'criteria' => ['type' => 'photos_count', 'target' => 5],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->assertFalse($this->badgeService->shouldAwardBadge($user, $badge));
    }

    public function test_criteria_profile_complete(): void
    {
        $user = User::factory()->create();
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

        $badge = Badge::create([
            'slug' => 'complete',
            'name' => 'Complete Profile',
            'description' => 'Complete your profile',
            'icon' => 'user',
            'color' => '#fff',
            'criteria' => ['type' => 'profile_complete'],
            'points' => 20,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->assertTrue($this->badgeService->shouldAwardBadge($user, $badge));
    }

    // --- awardBadge ---

    public function test_award_badge_sets_progress_to_100(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        $badge = Badge::create([
            'slug' => 'test',
            'name' => 'Test Badge',
            'description' => 'Test',
            'icon' => 'star',
            'color' => '#fff',
            'criteria' => ['type' => 'verified_profile'],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->badgeService->awardBadge($user, $badge);

        $userBadge = $user->badges()->where('badge_id', $badge->id)->first();
        $this->assertEquals(100, $userBadge->pivot->progress);
        $this->assertNotNull($userBadge->pivot->awarded_at);
    }

    public function test_award_badge_grants_bonus_gems(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        $badge = Badge::create([
            'slug' => 'test',
            'name' => 'Test Badge',
            'description' => 'Test',
            'icon' => 'star',
            'color' => '#fff',
            'criteria' => ['type' => 'verified_profile'],
            'points' => 25,
            'rarity' => 'rare',
            'is_active' => true,
        ]);

        $this->badgeService->awardBadge($user, $badge);

        $user->refresh();
        $this->assertEquals(25, $user->gems);
    }

    public function test_award_badge_no_gems_when_zero_points(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        $badge = Badge::create([
            'slug' => 'test',
            'name' => 'Test Badge',
            'description' => 'Test',
            'icon' => 'star',
            'color' => '#fff',
            'criteria' => ['type' => 'verified_profile'],
            'points' => 0,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->badgeService->awardBadge($user, $badge);

        $user->refresh();
        $this->assertEquals(0, $user->gems);
    }

    // --- updateProgress ---

    public function test_update_progress_calculates_percentage(): void
    {
        $user = User::factory()->create();
        Photo::create([
            'user_id' => $user->id,
            'path' => 'photos/test.jpg',
            'is_approved' => true,
            'is_primary' => true,
        ]);

        $badge = Badge::create([
            'slug' => 'photos5',
            'name' => '5 Photos',
            'description' => 'Upload 5 photos',
            'icon' => 'camera',
            'color' => '#fff',
            'criteria' => ['type' => 'photos_count', 'target' => 5],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->badgeService->updateProgress($user, $badge);

        $userBadge = $user->badges()->where('badge_id', $badge->id)->first();
        $this->assertEquals(20, $userBadge->pivot->progress); // 1/5 = 20%
    }

    public function test_progress_caps_at_100(): void
    {
        $user = User::factory()->create();
        for ($i = 0; $i < 10; $i++) {
            Photo::create([
                'user_id' => $user->id,
                'path' => "photos/test{$i}.jpg",
                'is_approved' => true,
                'is_primary' => $i === 0,
            ]);
        }

        $badge = Badge::create([
            'slug' => 'photos5',
            'name' => '5 Photos',
            'description' => 'Upload 5 photos',
            'icon' => 'camera',
            'color' => '#fff',
            'criteria' => ['type' => 'photos_count', 'target' => 5],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        $this->badgeService->updateProgress($user, $badge);

        $userBadge = $user->badges()->where('badge_id', $badge->id)->first();
        $this->assertEquals(100, $userBadge->pivot->progress);
    }

    // --- checkAndAwardBadges ---

    public function test_check_and_award_badges_returns_awarded(): void
    {
        $user = User::factory()->create(['is_verified' => true, 'is_premium' => true]);

        Badge::create([
            'slug' => 'verified',
            'name' => 'Verified',
            'description' => 'Be verified',
            'icon' => 'check',
            'color' => '#fff',
            'criteria' => ['type' => 'verified_profile'],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);

        Badge::create([
            'slug' => 'photos100',
            'name' => '100 Photos',
            'description' => 'Upload 100 photos',
            'icon' => 'camera',
            'color' => '#fff',
            'criteria' => ['type' => 'photos_count', 'target' => 100],
            'points' => 50,
            'rarity' => 'legendary',
            'is_active' => true,
        ]);

        $awarded = $this->badgeService->checkAndAwardBadges($user);

        $this->assertCount(1, $awarded);
        $this->assertEquals('verified', $awarded[0]->slug);
    }

    // --- getUserBadges ---

    public function test_get_user_badges_returns_all_active_badges(): void
    {
        $user = User::factory()->create();

        Badge::create([
            'slug' => 'badge1',
            'name' => 'Badge 1',
            'description' => 'Test',
            'icon' => 'star',
            'color' => '#fff',
            'criteria' => ['type' => 'verified_profile'],
            'points' => 10,
            'rarity' => 'common',
            'is_active' => true,
        ]);
        Badge::create([
            'slug' => 'badge2',
            'name' => 'Badge 2',
            'description' => 'Test',
            'icon' => 'star',
            'color' => '#fff',
            'criteria' => ['type' => 'premium_user'],
            'points' => 5,
            'rarity' => 'rare',
            'is_active' => true,
        ]);
        Badge::create([
            'slug' => 'inactive',
            'name' => 'Inactive',
            'description' => 'Inactive badge',
            'icon' => 'x',
            'color' => '#000',
            'criteria' => null,
            'points' => 0,
            'rarity' => 'common',
            'is_active' => false,
        ]);

        $badges = $this->badgeService->getUserBadges($user);

        $this->assertCount(2, $badges);
        $this->assertFalse($badges[0]['is_awarded']);
        $this->assertEquals(0, $badges[0]['progress']);
    }
}
