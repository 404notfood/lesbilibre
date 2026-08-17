<?php

namespace Tests\Feature;

use App\Models\Referral;
use App\Models\User;
use App\Models\VerificationPhoto;
use App\Services\ReferralService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class ReferralProgramTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_member_can_open_referral_page_and_get_a_personal_code(): void
    {
        $user = User::factory()->create(['referral_code' => null]);

        $this->actingAs($user)
            ->get(route('referrals.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Referrals/Index')
                ->where('program.enabled', true)
                ->where('stats.total', 0)
                ->has('program.code')
                ->has('program.url')
            );

        $this->assertNotNull($user->fresh()->referral_code);
    }

    public function test_registration_with_a_valid_code_attributes_the_referral(): void
    {
        $referrer = User::factory()->create();
        $code = app(ReferralService::class)->ensureReferralCode($referrer);

        $this->post('/register', $this->registrationPayload([
            'referral_code' => strtolower($code),
        ]))->assertRedirect('/dashboard');

        $referredUser = User::query()->where('email', 'invitee@example.com')->firstOrFail();

        $this->assertDatabaseHas('referrals', [
            'referrer_id' => $referrer->id,
            'referred_user_id' => $referredUser->id,
            'code' => $code,
            'status' => Referral::STATUS_PENDING,
        ]);
    }

    public function test_registration_rejects_an_unknown_referral_code(): void
    {
        $this->post('/register', $this->registrationPayload([
            'referral_code' => 'INCONNU999',
        ]))->assertSessionHasErrors('referral_code');

        $this->assertDatabaseMissing('users', ['email' => 'invitee@example.com']);
    }

    public function test_profile_verification_rewards_both_members_once(): void
    {
        $admin = User::factory()->create(['is_admin' => true]);
        $referrer = User::factory()->create(['gems' => 10]);
        $referredUser = User::factory()->create(['gems' => 5, 'is_verified' => false]);
        $code = app(ReferralService::class)->ensureReferralCode($referrer);
        $referral = app(ReferralService::class)->attributeReferral($referredUser, $code);
        $verification = VerificationPhoto::factory()->create(['user_id' => $referredUser->id]);

        $this->actingAs($admin)
            ->post(route('admin.verifications.approve', $verification))
            ->assertRedirect();

        $this->assertSame(160, $referrer->fresh()->gems);
        $this->assertSame(55, $referredUser->fresh()->gems);
        $this->assertSame(Referral::STATUS_REWARDED, $referral->fresh()->status);

        app(ReferralService::class)->rewardVerifiedUser($referredUser->fresh());

        $this->assertSame(160, $referrer->fresh()->gems);
        $this->assertSame(55, $referredUser->fresh()->gems);
        $this->assertDatabaseCount('gem_transactions', 2);
    }

    public function test_banned_referrer_is_not_rewarded(): void
    {
        $referrer = User::factory()->create(['gems' => 0, 'is_banned' => true]);
        $referredUser = User::factory()->create(['gems' => 0, 'is_verified' => true]);
        $code = app(ReferralService::class)->ensureReferralCode($referrer);
        $referral = app(ReferralService::class)->attributeReferral($referredUser, $code);

        app(ReferralService::class)->rewardVerifiedUser($referredUser);

        $this->assertSame(0, $referrer->fresh()->gems);
        $this->assertSame(0, $referredUser->fresh()->gems);
        $this->assertSame(Referral::STATUS_PENDING, $referral->fresh()->status);
    }

    public function test_only_admin_can_open_referral_tracking(): void
    {
        $member = User::factory()->create(['is_admin' => false]);
        $admin = User::factory()->create(['is_admin' => true]);

        $this->actingAs($member)
            ->get(route('admin.referrals.index'))
            ->assertForbidden();

        $this->actingAs($admin)
            ->get(route('admin.referrals.index'))
            ->assertOk()
            ->assertInertia(fn (AssertableInertia $page) => $page
                ->component('Admin/Referrals/Index')
                ->where('stats.total', 0)
            );
    }

    public function test_referral_is_included_in_the_referrers_data_export(): void
    {
        $referrer = User::factory()->create();
        $referredUser = User::factory()->create();
        $code = app(ReferralService::class)->ensureReferralCode($referrer);
        app(ReferralService::class)->attributeReferral($referredUser, $code);

        $this->actingAs($referrer)
            ->get(route('settings.data-export'))
            ->assertOk()
            ->assertJsonPath('referrals.0.role', 'referrer')
            ->assertJsonPath('referrals.0.status', Referral::STATUS_PENDING);
    }

    public function test_account_erasure_removes_referral_relationships(): void
    {
        $referrer = User::factory()->create();
        $referredUser = User::factory()->create();
        $code = app(ReferralService::class)->ensureReferralCode($referrer);
        $referral = app(ReferralService::class)->attributeReferral($referredUser, $code);

        $this->actingAs($referrer)
            ->delete(route('settings.delete-account'), ['confirmation' => 'SUPPRIMER'])
            ->assertRedirect('/');

        $this->assertDatabaseMissing('referrals', ['id' => $referral->id]);
    }

    /** @param array<string, mixed> $overrides */
    private function registrationPayload(array $overrides = []): array
    {
        return array_merge([
            'pseudo' => 'invitee',
            'name' => 'Invitée',
            'age' => 27,
            'city_name' => 'Paris',
            'city_latitude' => 48.8566,
            'city_longitude' => 2.3522,
            'city_postal_code' => '75001',
            'sexual_orientation' => 'lesbian',
            'interested_in' => 'single_woman',
            'looking_for' => 'relationship',
            'email' => 'invitee@example.com',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ], $overrides);
    }
}
