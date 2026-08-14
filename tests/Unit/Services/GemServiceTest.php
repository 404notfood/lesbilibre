<?php

namespace Tests\Unit\Services;

use App\Models\GemTransaction;
use App\Models\Photo;
use App\Models\Profile;
use App\Models\Setting;
use App\Models\User;
use App\Services\GemService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GemServiceTest extends TestCase
{
    use RefreshDatabase;

    protected GemService $gemService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->gemService = new GemService;
    }

    // --- addGems ---

    public function test_add_gems_increments_user_balance(): void
    {
        $user = User::factory()->create(['gems' => 100]);

        $this->gemService->addGems($user, 50, 'earn', 'test', 'Test bonus');

        $user->refresh();
        $this->assertEquals(150, $user->gems);
    }

    public function test_add_gems_creates_transaction_record(): void
    {
        $user = User::factory()->create(['gems' => 0]);

        $transaction = $this->gemService->addGems($user, 25, 'earn', 'test', 'Description');

        $this->assertInstanceOf(GemTransaction::class, $transaction);
        $this->assertEquals(25, $transaction->amount);
        $this->assertEquals(25, $transaction->balance_after);
        $this->assertEquals('earn', $transaction->type);
        $this->assertEquals('test', $transaction->reason);
    }

    public function test_add_gems_stores_metadata(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        $meta = ['source' => 'purchase', 'ref' => 'abc123'];

        $transaction = $this->gemService->addGems($user, 10, 'earn', 'test', null, $meta);

        $this->assertEquals($meta, $transaction->metadata);
    }

    // --- deductGems ---

    public function test_deduct_gems_with_sufficient_balance(): void
    {
        $user = User::factory()->create(['gems' => 100]);

        $transaction = $this->gemService->deductGems($user, 30, 'spend', 'test');

        $user->refresh();
        $this->assertNotNull($transaction);
        $this->assertEquals(70, $user->gems);
        $this->assertEquals(-30, $transaction->amount);
        $this->assertEquals(70, $transaction->balance_after);
    }

    public function test_deduct_gems_with_insufficient_balance_returns_null(): void
    {
        $user = User::factory()->create(['gems' => 10]);

        $transaction = $this->gemService->deductGems($user, 50, 'spend', 'test');

        $this->assertNull($transaction);
        $user->refresh();
        $this->assertEquals(10, $user->gems);
    }

    public function test_deduct_gems_with_exact_balance(): void
    {
        $user = User::factory()->create(['gems' => 50]);

        $transaction = $this->gemService->deductGems($user, 50, 'spend', 'test');

        $this->assertNotNull($transaction);
        $user->refresh();
        $this->assertEquals(0, $user->gems);
    }

    // --- hasEnoughGems ---

    public function test_has_enough_gems_true(): void
    {
        $user = User::factory()->create(['gems' => 100]);

        $this->assertTrue($this->gemService->hasEnoughGems($user, 50));
        $this->assertTrue($this->gemService->hasEnoughGems($user, 100));
    }

    public function test_has_enough_gems_false(): void
    {
        $user = User::factory()->create(['gems' => 10]);

        $this->assertFalse($this->gemService->hasEnoughGems($user, 11));
    }

    // --- grantDailyLoginBonus ---

    public function test_grant_daily_login_bonus_first_time(): void
    {
        $user = User::factory()->create(['gems' => 0]);

        $transaction = $this->gemService->grantDailyLoginBonus($user);

        $this->assertNotNull($transaction);
        $this->assertEquals('daily_login', $transaction->reason);
        $user->refresh();
        $this->assertGreaterThan(0, $user->gems);
    }

    public function test_grant_daily_login_bonus_prevents_duplicate_same_day(): void
    {
        $user = User::factory()->create(['gems' => 0]);

        $this->gemService->grantDailyLoginBonus($user);
        $second = $this->gemService->grantDailyLoginBonus($user);

        $this->assertNull($second);
    }

    public function test_grant_daily_login_bonus_uses_setting_value(): void
    {
        Setting::set('gems_reward_daily_login', 15, 'integer');
        $user = User::factory()->create(['gems' => 0]);

        $this->gemService->grantDailyLoginBonus($user);

        $user->refresh();
        $this->assertEquals(15, $user->gems);
    }

    // --- grantProfileCompletionBonus ---

    public function test_grant_profile_completion_bonus_when_complete(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        Profile::create([
            'user_id' => $user->id,
            'bio' => 'Test bio',
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
        ]);
        Photo::create([
            'user_id' => $user->id,
            'path' => 'photos/test.jpg',
            'is_primary' => true,
            'is_approved' => true,
        ]);

        $transaction = $this->gemService->grantProfileCompletionBonus($user);

        $this->assertNotNull($transaction);
        $this->assertEquals('profile_completion', $transaction->reason);
    }

    public function test_grant_profile_completion_bonus_only_once(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        Profile::create([
            'user_id' => $user->id,
            'bio' => 'Test',
            'date_of_birth' => '1995-01-01',
            'city' => 'Paris',
            'sexual_orientation' => 'lesbian',
            'looking_for' => 'relationship',
        ]);
        Photo::create([
            'user_id' => $user->id,
            'path' => 'photos/test.jpg',
            'is_primary' => true,
            'is_approved' => true,
        ]);

        $this->gemService->grantProfileCompletionBonus($user);
        $second = $this->gemService->grantProfileCompletionBonus($user);

        $this->assertNull($second);
    }

    public function test_grant_profile_completion_bonus_null_when_incomplete(): void
    {
        $user = User::factory()->create(['gems' => 0]);
        // No profile created

        $transaction = $this->gemService->grantProfileCompletionBonus($user);

        $this->assertNull($transaction);
    }

    // --- grantFirstMatchBonus ---

    public function test_grant_first_match_bonus(): void
    {
        $user = User::factory()->create(['gems' => 0]);

        $transaction = $this->gemService->grantFirstMatchBonus($user);

        $this->assertNotNull($transaction);
        $this->assertEquals('first_match', $transaction->reason);
    }

    public function test_grant_first_match_bonus_only_once(): void
    {
        $user = User::factory()->create(['gems' => 0]);

        $this->gemService->grantFirstMatchBonus($user);
        $second = $this->gemService->grantFirstMatchBonus($user);

        $this->assertNull($second);
    }

    // --- grantPhotoUploadBonus ---

    public function test_grant_photo_upload_bonus(): void
    {
        $user = User::factory()->create(['gems' => 0]);

        $transaction = $this->gemService->grantPhotoUploadBonus($user);

        $this->assertNotNull($transaction);
        $this->assertEquals('photo_upload', $transaction->reason);
    }

    public function test_grant_photo_upload_bonus_max_5(): void
    {
        $user = User::factory()->create(['gems' => 0]);

        for ($i = 0; $i < 5; $i++) {
            $this->assertNotNull($this->gemService->grantPhotoUploadBonus($user));
        }

        $sixth = $this->gemService->grantPhotoUploadBonus($user);
        $this->assertNull($sixth);
    }

    // --- chargeForMessage ---

    public function test_charge_for_message_premium_user_free(): void
    {
        Setting::set('require_gems_for_messages', true, 'boolean');
        $user = User::factory()->create(['gems' => 100, 'is_premium' => true, 'premium_expires_at' => now()->addMonth()]);

        $transaction = $this->gemService->chargeForMessage($user, 1);

        $this->assertNull($transaction);
        $user->refresh();
        $this->assertEquals(100, $user->gems);
    }

    public function test_charge_for_message_disabled_by_setting(): void
    {
        Setting::set('require_gems_for_messages', false, 'boolean');
        $user = User::factory()->create(['gems' => 100, 'is_premium' => false]);

        $transaction = $this->gemService->chargeForMessage($user, 1);

        $this->assertNull($transaction);
    }

    public function test_charge_for_message_non_premium_when_enabled(): void
    {
        Setting::set('require_gems_for_messages', true, 'boolean');
        Setting::set('gems_cost_message', 2, 'integer');
        $user = User::factory()->create(['gems' => 100, 'is_premium' => false]);

        $transaction = $this->gemService->chargeForMessage($user, 42);

        $this->assertNotNull($transaction);
        $this->assertEquals(-2, $transaction->amount);
        $this->assertEquals(['message_id' => 42], $transaction->metadata);
    }

    // --- chargeForChatPhoto ---

    public function test_charge_for_chat_photo_premium_free(): void
    {
        $user = User::factory()->create(['gems' => 100, 'is_premium' => true, 'premium_expires_at' => now()->addMonth()]);

        $result = $this->gemService->chargeForChatPhoto($user, 1);

        $this->assertNull($result);
    }

    public function test_charge_for_chat_photo_costs_5_gems(): void
    {
        $user = User::factory()->create(['gems' => 100, 'is_premium' => false]);

        $transaction = $this->gemService->chargeForChatPhoto($user, 1);

        $this->assertNotNull($transaction);
        $this->assertEquals(-5, $transaction->amount);
    }

    // --- chargeForBoost ---

    public function test_charge_for_boost(): void
    {
        Setting::set('gems_cost_boost', 20, 'integer');
        $user = User::factory()->create(['gems' => 100]);

        $transaction = $this->gemService->chargeForBoost($user);

        $this->assertNotNull($transaction);
        $this->assertEquals('boost_profile', $transaction->reason);
    }

    // --- chargeForSuperLike ---

    public function test_charge_for_super_like(): void
    {
        Setting::set('gems_cost_super_like', 5, 'integer');
        $user = User::factory()->create(['gems' => 100]);

        $transaction = $this->gemService->chargeForSuperLike($user, 99);

        $this->assertNotNull($transaction);
        $this->assertEquals(['target_user_id' => 99], $transaction->metadata);
    }

    // --- chargeForRevealLike ---

    public function test_charge_for_reveal_like_premium_free(): void
    {
        $user = User::factory()->create(['gems' => 100, 'is_premium' => true, 'premium_expires_at' => now()->addMonth()]);

        $result = $this->gemService->chargeForRevealLike($user, 1);

        $this->assertNull($result);
    }

    public function test_charge_for_reveal_like_non_premium(): void
    {
        Setting::set('gems_cost_reveal_like', 2, 'integer');
        $user = User::factory()->create(['gems' => 100, 'is_premium' => false]);

        $transaction = $this->gemService->chargeForRevealLike($user, 5);

        $this->assertNotNull($transaction);
        $this->assertEquals(-2, $transaction->amount);
    }

    // --- getTransactionHistory ---

    public function test_get_transaction_history(): void
    {
        $user = User::factory()->create(['gems' => 0]);

        $this->gemService->addGems($user, 10, 'earn', 'test1');
        $this->gemService->addGems($user, 20, 'earn', 'test2');
        $this->gemService->addGems($user, 30, 'earn', 'test3');

        $history = $this->gemService->getTransactionHistory($user, 2);

        $this->assertCount(2, $history);
    }
}
