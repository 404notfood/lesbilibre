<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SeoAndPublicExperienceTest extends TestCase
{
    use RefreshDatabase;

    public function test_preview_environment_is_noindex_by_default(): void
    {
        config()->set('seo.indexing_enabled', false);

        $this->get('/')
            ->assertOk()
            ->assertHeader('X-Robots-Tag', 'noindex, nofollow, noarchive')
            ->assertSee('<meta name="robots" content="noindex, nofollow, noarchive">', false);

        $this->get('/robots.txt')
            ->assertOk()
            ->assertSee("User-agent: *\nDisallow: /", false);
    }

    public function test_final_domain_mode_indexes_only_public_pages(): void
    {
        config()->set('seo.indexing_enabled', true);

        $this->get('/')
            ->assertHeader('X-Robots-Tag', 'index, follow')
            ->assertSee('<meta name="robots" content="index, follow">', false);

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
