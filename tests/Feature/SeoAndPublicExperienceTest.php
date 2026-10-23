<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Vite;
use Inertia\Ssr\Gateway;
use Inertia\Ssr\Response as SsrResponse;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeoAndPublicExperienceTest extends TestCase
{
    use RefreshDatabase;

    public function test_home_loads_without_pilot_or_unverified_social_proof(): void
    {
        $this->get('/')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('home')->missing('pilot')
            ->missing('stats')->missing('testimonials'));
        $this->get('/installer')->assertOk()->assertInertia(fn (Assert $page) => $page->component('StaticPages/Install'));
    }

    public function test_preview_environment_is_noindex_by_default(): void
    {
        config()->set('seo.indexing_enabled', false);

        $this->get('/')
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
            ->assertSee('name="robots" content="noindex, nofollow, noarchive"', false);

        $this->get('/robots.txt')
            ->assertOk()
            ->assertSee("User-agent: *\nDisallow: /", false);
    }

    public function test_final_domain_mode_indexes_only_public_pages(): void
    {
        config()->set('seo.indexing_enabled', true);

        $this->get('/')
            ->assertHeader('X-Robots-Tag', 'index, follow')
            ->assertSee('name="robots" content="index, follow"', false);

        $this->get('/login')
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');

        $this->get('/robots.txt')
            ->assertOk()
            ->assertSee('User-agent: OAI-SearchBot')
            ->assertSee('Sitemap: '.rtrim(config('app.url'), '/').'/sitemap.xml', false);
    }

    public function test_sitemap_contains_public_pages_and_guides_only(): void
    {
        $response = $this->get('/sitemap.xml');

        $response
            ->assertOk()
            ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
            ->assertSee(route('safety'), false)
            ->assertSee(route('guides.show', 'premiere-rencontre-en-securite'), false)
            ->assertDontSee('/dashboard', false)
            ->assertDontSee('/profile/', false);
    }

    public function test_direct_auth_pages_keep_response_headers_below_the_fastcgi_default(): void
    {
        foreach (['/login', '/register'] as $path) {
            Vite::flush();
            $response = $this->get($path)->assertOk();
            $headerBytes = strlen((string) $response->baseResponse->headers);

            $this->assertLessThan(4096, $headerBytes, "{$path}: {$headerBytes} header bytes");
        }
    }

    public function test_dotted_route_names_use_their_own_metadata(): void
    {
        $this->get('/guides')->assertOk()
            ->assertSee('Guides de rencontre et de sécurité | LesbiLibre', false)
            ->assertSee(config('seo.pages')['guides.index']['description'], false);
    }

    public function test_structured_data_is_valid_schema_json_without_compiled_blade(): void
    {
        foreach (['/', '/guides/reconnaitre-un-faux-profil'] as $path) {
            $html = $this->get($path)->assertOk()->getContent();
            preg_match('/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/s', $html, $matches);
            $schema = json_decode($matches[1], true, 512, JSON_THROW_ON_ERROR);

            $this->assertSame('https://schema.org', $schema['@context'] ?? null);
            $this->assertNotEmpty($schema['@graph']);
            $this->assertStringNotContainsString('<?php', $matches[1]);
        }
    }

    public function test_ssr_head_does_not_duplicate_the_fallback_title(): void
    {
        $this->mock(Gateway::class)->shouldReceive('dispatch')->once()->andReturn(
            new SsrResponse('<title inertia>SSR title</title>', '<div id="app"><h1>SSR content</h1></div>')
        );

        $html = $this->get('/')->assertOk()->getContent();

        $this->assertSame(1, substr_count($html, '<title'));
        $this->assertStringContainsString('SSR content', $html);
    }

    public function test_inertia_navigation_receives_current_page_metadata(): void
    {
        config()->set('seo.indexing_enabled', true);
        $headers = [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => app(\App\Http\Middleware\HandleInertiaRequests::class)->version(\Illuminate\Http\Request::create('/')),
        ];

        $this->get('/guides', $headers)
            ->assertOk()
            ->assertJsonPath('props.seo.title', config('seo.pages')['guides.index']['title'])
            ->assertJsonPath('props.seo.canonical', rtrim(config('app.url'), '/').'/guides')
            ->assertJsonPath('props.seo.robots', 'index, follow');

        $this->get('/guides/reconnaitre-un-faux-profil', $headers)
            ->assertOk()
            ->assertJsonPath('props.seo.title', config('guides.reconnaitre-un-faux-profil.title').' | LesbiLibre')
            ->assertJsonPath('props.seo.schema.@context', 'https://schema.org')
            ->assertJsonPath('props.seo.schema.@graph.2.@type', 'Article');

        $this->get('/login', $headers)
            ->assertOk()
            ->assertJsonPath('props.seo.canonical', null)
            ->assertJsonPath('props.seo.robots', 'noindex, nofollow, noarchive');
    }

    public function test_public_product_pages_and_guides_are_available(): void
    {
        $this->get('/comment-ca-marche')->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('StaticPages/Editorial')
        );
        $this->get('/securite')->assertOk();
        $this->get('/fonctionnalites')->assertOk();
        $this->get('/tarifs')->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('StaticPages/Pricing')
                ->has('plans')->has('gemPackages')
        );
        $this->get('/guides')->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('Guides/Index')->has('guides', 6)
        );
        $this->get('/guides/reconnaitre-un-faux-profil')->assertOk()->assertInertia(
            fn (Assert $page) => $page->component('Guides/Show')
                ->where('guide.slug', 'reconnaitre-un-faux-profil')
                ->where('structuredData.@type', 'Article')
        );
        $this->get('/guides/inconnu')->assertNotFound();
    }

    public function test_authenticated_pages_share_the_six_activation_steps(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/settings/profile')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('onboarding.total', 6)
                ->has('onboarding.steps', 6)
                ->where('onboarding.steps.0.id', 'profile')
                ->where('onboarding.steps.5.id', 'first_message'));
    }
}
