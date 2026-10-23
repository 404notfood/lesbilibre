<?php

namespace Tests\Feature\Admin;

use App\Models\IntegrationCredential;
use App\Models\Setting;
use App\Models\User;
use App\Services\IntegrationSettings;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeoSettingsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutVite();
    }

    public function test_only_administrators_can_manage_seo_and_keys(): void
    {
        $this->get('/admin/seo')->assertRedirect('/login');
        $this->actingAs(User::factory()->communityMember()->create())
            ->get('/admin/seo')->assertForbidden();
        $this->putJson('/admin/seo/robots', $this->robots())->assertForbidden();
        $this->putJson('/admin/seo/integrations', ['google_login_enabled' => false])->assertForbidden();
    }

    public function test_editor_changes_both_robots_and_public_indexing_immediately(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->put('/admin/seo/robots', $this->robots())->assertRedirect();
        $this->get('/robots.txt')->assertOk()->assertSee("Disallow: /essai\n", false);
        $this->get('/')->assertHeader('X-Robots-Tag', 'index, follow');
        $this->get('/admin/seo')->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        $this->put('/admin/seo/robots', array_replace($this->robots(), ['indexing_enabled' => false]))->assertRedirect();
        $this->get('/robots.txt')->assertSee("User-agent: *\nDisallow: /\n", false)->assertDontSee('/essai');
        $this->get('/')->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
        $this->assertSame("User-agent: *\nDisallow: /essai\n", Setting::get('seo_robots_content'));
    }

    public function test_reset_restores_automatic_robots_and_rejects_invalid_text(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $this->putJson('/admin/seo/robots', array_replace($this->robots(), ['robots_content' => '<script>oops</script>']))->assertUnprocessable()->assertJsonValidationErrors('robots_content');
        $this->put('/admin/seo/robots', array_replace($this->robots(), ['custom_robots' => false]))->assertRedirect();
        $this->get('/robots.txt')->assertSee('Sitemap: '.rtrim(config('app.url'), '/').'/sitemap.xml', false);
        $this->assertNull(Setting::get('seo_robots_content'));
    }

    public function test_credentials_are_encrypted_hidden_and_can_be_replaced_or_removed(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->put('/admin/seo/integrations', ['google_login_enabled' => false, 'semrush_api_key' => 'private-test-key'])->assertRedirect();
        $credential = IntegrationCredential::query()->where('name', 'semrush_api_key')->firstOrFail();
        $this->assertNotSame('private-test-key', $credential->getRawOriginal('value'));
        $this->assertSame('private-test-key', app(IntegrationSettings::class)->get('semrush_api_key'));
        $this->assertArrayNotHasKey('value', $credential->toArray());
        $this->get('/admin/seo')->assertOk()->assertDontSee('private-test-key')->assertInertia(fn (Assert $page) => $page
            ->where('integrations.credentials.semrush_api_key.configured', true));
        $this->put('/admin/seo/integrations', ['google_login_enabled' => false, 'semrush_api_key' => ''])->assertRedirect();
        $this->assertSame('private-test-key', app(IntegrationSettings::class)->get('semrush_api_key'));
        $this->put('/admin/seo/integrations', ['google_login_enabled' => false, 'remove_semrush_api_key' => true])->assertRedirect();
        $this->assertNull(app(IntegrationSettings::class)->get('semrush_api_key'));
    }

    public function test_invalid_credentials_are_not_flashed_and_oauth_requires_both_credentials(): void
    {
        $this->actingAs(User::factory()->create(['is_admin' => true]));
        $this->put('/admin/seo/integrations', [
            'google_login_enabled' => true, 'semrush_api_key' => 'do-not-flash-this',
            'google_search_console_credentials' => 'invalid-private-json',
        ])->assertSessionHasErrors('google_search_console_credentials');
        $this->assertArrayNotHasKey('semrush_api_key', session()->getOldInput());
        $this->assertArrayNotHasKey('google_search_console_credentials', session()->getOldInput());
        $this->putJson('/admin/seo/integrations', ['google_login_enabled' => true])
            ->assertUnprocessable()->assertJsonValidationErrors('google_client_id');
        $this->assertDatabaseCount('integration_credentials', 0);
    }

    public function test_changing_integrations_requires_recent_password_when_enabled(): void
    {
        config(['admin-security.require_recent_password' => true]);
        $this->actingAs(User::factory()->create(['is_admin' => true]))
            ->putJson('/admin/seo/integrations', ['google_login_enabled' => false])->assertStatus(423);
        $this->putJson('/admin/seo/robots', $this->robots())->assertStatus(423);
    }

    private function robots(): array
    {
        return ['indexing_enabled' => true, 'custom_robots' => true, 'robots_content' => "User-agent: *\r\nDisallow: /essai\r\n"];
    }
}
