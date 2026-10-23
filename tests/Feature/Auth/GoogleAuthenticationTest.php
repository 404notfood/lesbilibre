<?php

namespace Tests\Feature\Auth;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class GoogleAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
        Http::preventStrayRequests();
        Notification::fake();
        config([
            'services.integrations.google_client_id' => 'test.apps.googleusercontent.com',
            'services.integrations.google_client_secret' => 'test-client-secret',
        ]);
        Setting::set('google_login_enabled', true, 'boolean');
    }

    public function test_redirect_uses_state_and_pkce_with_only_identity_scopes(): void
    {
        $response = $this->get('/auth/google')->assertRedirect();
        parse_str(parse_url($response->headers->get('Location'), PHP_URL_QUERY), $query);
        $this->assertSame('openid email profile', $query['scope']);
        $this->assertSame('S256', $query['code_challenge_method']);
        $this->assertSame(session('google_oauth.state'), $query['state']);
        $this->assertSame(rtrim(config('app.url'), '/').'/auth/google/callback', $query['redirect_uri']);
        $this->assertStringNotContainsString('test-client-secret', $response->headers->get('Location'));
    }

    public function test_callback_rejects_missing_expired_or_incorrect_state_before_network_calls(): void
    {
        foreach ([null, ['state' => 'expected', 'verifier' => 'verifier', 'expires_at' => now()->subMinute()->timestamp],
            ['state' => 'different', 'verifier' => 'verifier', 'expires_at' => now()->addMinute()->timestamp]] as $flow) {
            $this->withSession(['google_oauth' => $flow])->get('/auth/google/callback?state=expected&code=code')
                ->assertRedirect('/login')->assertSessionHas('error');
            $this->assertGuest();
        }
        Http::assertNothingSent();
    }

    public function test_new_google_identity_must_complete_registration_before_a_user_is_created(): void
    {
        $this->fakeIdentity();
        $this->startCallback()->assertRedirect('/register')->assertSessionHas('google_registration.email', 'person@gmail.com');
        $this->assertGuest();
        $this->assertDatabaseCount('users', 0);
        $this->get('/register')->assertOk()->assertDontSee('test-access-token');
        $this->post('/register', [])->assertSessionHasErrors(['date_of_birth', 'community_charter', 'data_processing_consent']);
        $this->assertDatabaseCount('users', 0);

        $this->post('/register', $this->registration())->assertRedirect('/dashboard');
        $user = User::query()->firstOrFail();
        $this->assertAuthenticatedAs($user);
        $this->assertSame('google-subject', $user->google_id);
        $this->assertSame('person@gmail.com', $user->email);
        $this->assertNotNull($user->email_verified_at);
        $this->assertFalse((bool) $user->is_verified);
        $this->assertFalse((bool) $user->is_admin);
        $this->assertNotNull($user->profile->birth_date_declared_at);
        $this->assertNull(session('google_registration'));
    }

    public function test_existing_email_is_never_automatically_linked_to_google(): void
    {
        $user = User::factory()->withoutTwoFactor()->create(['email' => 'person@gmail.com']);
        $this->fakeIdentity();
        $this->startCallback()->assertRedirect('/login')->assertSessionHas('error');
        $this->assertGuest();
        $this->assertNull($user->fresh()->google_id);
    }

    public function test_linked_account_can_login_and_google_subject_is_hidden(): void
    {
        $user = User::factory()->withoutTwoFactor()->create();
        $user->forceFill(['google_id' => 'google-subject'])->save();
        $this->fakeIdentity();
        $this->startCallback()->assertRedirect('/dashboard');
        $this->assertAuthenticatedAs($user);
        $this->assertArrayNotHasKey('google_id', $user->toArray());
    }

    public function test_google_login_does_not_bypass_two_factor_authentication(): void
    {
        $user = User::factory()->create();
        $user->forceFill(['google_id' => 'google-subject'])->save();
        $this->fakeIdentity();
        $this->startCallback()->assertRedirect('/two-factor-challenge')->assertSessionHas('login.id', $user->id);
        $this->assertGuest();
    }

    public function test_banned_and_deleted_accounts_cannot_login_or_be_recreated(): void
    {
        $user = User::factory()->withoutTwoFactor()->create(['is_banned' => true]);
        $user->forceFill(['google_id' => 'google-subject'])->save();
        $this->fakeIdentity();
        $this->startCallback()->assertRedirect('/login');
        $this->assertGuest();
        $user->delete();
        $this->startCallback()->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_unverified_identity_and_remote_failures_do_not_create_accounts(): void
    {
        $this->fakeIdentity(['email_verified' => false]);
        $this->startCallback()->assertRedirect('/login');
        $this->assertDatabaseCount('users', 0);
        Http::fake(['https://oauth2.googleapis.com/token' => Http::response([], 503)]);
        $this->startCallback()->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_disabled_google_login_hides_the_feature_and_blocks_the_routes(): void
    {
        Setting::set('google_login_enabled', false, 'boolean');
        $this->get('/auth/google')->assertNotFound();
        $this->get('/login')->assertOk()->assertInertia(fn ($page) => $page->where('googleEnabled', false));
    }

    public function test_external_email_still_needs_local_email_verification(): void
    {
        $this->fakeIdentity(['email' => 'person@example.net']);
        $this->startCallback()->assertRedirect('/register');
        $this->post('/register', $this->registration())->assertRedirect('/dashboard');
        $this->assertNull(User::query()->firstOrFail()->email_verified_at);
    }

    public function test_google_registration_can_be_cancelled_or_expire_without_creating_an_account(): void
    {
        $this->fakeIdentity();
        $this->startCallback()->assertRedirect('/register');
        $this->post('/auth/google/cancel')->assertRedirect('/register')->assertSessionMissing('google_registration');
        $this->startCallback();
        $this->travel(21)->minutes();
        $this->post('/register', $this->registration())->assertSessionHasErrors('email');
        $this->assertDatabaseCount('users', 0);
    }

    private function fakeIdentity(array $overrides = []): void
    {
        Http::fake([
            'https://oauth2.googleapis.com/token' => Http::response(['access_token' => 'test-access-token']),
            'https://openidconnect.googleapis.com/v1/userinfo' => Http::response(array_replace([
                'sub' => 'google-subject', 'email' => 'person@gmail.com', 'given_name' => 'Person', 'email_verified' => true,
            ], $overrides)),
        ]);
    }

    private function startCallback(): \Illuminate\Testing\TestResponse
    {
        return $this->withSession(['google_oauth' => [
            'state' => 'expected', 'verifier' => 'test-verifier', 'expires_at' => now()->addMinute()->timestamp,
        ]])->get('/auth/google/callback?state=expected&code=test-code');
    }

    private function registration(): array
    {
        return [
            'pseudo' => 'google-person', 'name' => 'Person', 'email' => 'tampered@example.com',
            'date_of_birth' => '1998-04-12', 'community_charter' => true, 'data_processing_consent' => true,
            'meeting_intentions' => ['relationship'], 'city_name' => 'Laval', 'city_latitude' => 48.07,
            'city_longitude' => -0.77, 'interested_in' => 'single_woman',
        ];
    }
}
