<?php

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PwaMetadataTest extends TestCase
{
    use RefreshDatabase;

    public function test_application_declares_standard_and_apple_pwa_capabilities(): void
    {
        $response = $this->get('/');

        $response
            ->assertOk()
            ->assertSee('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">', false)
            ->assertSee('<meta name="mobile-web-app-capable" content="yes">', false)
            ->assertSee('<meta name="apple-mobile-web-app-capable" content="yes">', false)
            ->assertSee('<link rel="manifest" href="/manifest.json">', false)
            ->assertSee('<link rel="apple-touch-icon" href="/apple-touch-icon-lesbilibre.png" sizes="180x180">', false);
    }

    public function test_authenticated_html_json_and_logout_cannot_be_stored_in_http_caches(): void
    {
        $user = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        $conversation = Conversation::create(['user1_id' => $user->id, 'user2_id' => $other->id]);
        $this->actingAs($user)->get(route('conversations.show', $conversation))->assertOk()->assertHeader('Cache-Control', 'max-age=0, no-store, private')->assertHeader('Pragma', 'no-cache');
        $this->getJson(route('conversations.sync', $conversation).'?after_id=0')->assertOk()->assertHeader('Cache-Control', 'max-age=0, no-store, private');
        $this->post(route('logout'))->assertRedirect()->assertHeader('Cache-Control', 'max-age=0, no-store, private');
        $this->assertTrue(session('inertia.clear_history'));
    }

    public function test_private_inertia_history_is_encrypted_on_https_and_supports_http_local_tools(): void
    {
        $user = User::factory()->communityMember()->create();
        $other = User::factory()->communityMember()->create();
        $conversation = Conversation::create(['user1_id' => $user->id, 'user2_id' => $other->id]);
        $this->actingAs($user)->get('https://lesbi.test/conversations/'.$conversation->id)->assertOk()->assertViewHas('page', fn ($page) => $page['encryptHistory'] === true);
        $this->get('http://localhost/conversations/'.$conversation->id)->assertOk()->assertViewHas('page', fn ($page) => $page['encryptHistory'] === false);
    }

    public function test_guest_inertia_responses_are_not_cached_with_session_data(): void
    {
        $version = $this->get('/')->viewData('page')['version'];
        $this->get('/', ['X-Inertia' => 'true', 'X-Inertia-Version' => $version])->assertOk()->assertHeader('Cache-Control', 'max-age=0, no-store, private');
    }

    public function test_static_worker_and_manifest_have_explicit_server_headers(): void
    {
        // Laravel tests do not serve public files: check the Apache policy itself.
        $headers = file_get_contents(public_path('.htaccess'));
        $this->assertMatchesRegularExpression('/<Files "sw\.js">\s*Header always set Cache-Control "no-cache, no-store, must-revalidate"\s*Header always set Service-Worker-Allowed "\/"/', $headers);
        $this->assertStringContainsString('Header set Content-Type "application/manifest+json"', $headers);
    }

    public function test_manifest_targets_local_routes_and_uses_real_install_icons(): void
    {
        $manifest = json_decode(file_get_contents(public_path('manifest.json')), true, flags: JSON_THROW_ON_ERROR);
        $this->assertSame('/', $manifest['id']);
        $this->assertSame('/', $manifest['scope']);
        $this->assertSame('standalone', $manifest['display']);
        foreach ([$manifest['start_url'], ...array_column($manifest['shortcuts'], 'url')] as $url) {
            $this->assertStringStartsWith('/', $url);
            $this->assertStringNotContainsString('//', $url);
            $this->assertArrayNotHasKey('host', parse_url($url));
        }
        foreach ($manifest['icons'] as $icon) {
            $dimensions = getimagesize(public_path(ltrim($icon['src'], '/')));
            $this->assertSame($icon['sizes'], $dimensions[0].'x'.$dimensions[1]);
            $this->assertSame('image/png', $dimensions['mime']);
        }
    }
}
