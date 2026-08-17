<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function indexNowKey(): Response
    {
        $key = config('services.indexnow.key');
        abort_if(blank($key), 404);

        return response($key, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function robots(): Response
    {
        $siteUrl = rtrim(config('app.url'), '/');
        $content = config('seo.indexing_enabled')
            ? "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /settings\nDisallow: /dashboard\nDisallow: /profile\nDisallow: /conversations\n\nUser-agent: OAI-SearchBot\nAllow: /\nDisallow: /admin\nDisallow: /settings\nDisallow: /dashboard\nDisallow: /profile\nDisallow: /conversations\n\nSitemap: {$siteUrl}/sitemap.xml\n"
            : "User-agent: *\nDisallow: /\n";

        return response($content, 200, ['Content-Type' => 'text/plain; charset=UTF-8']);
    }

    public function sitemap(): Response
    {
        $urls = collect([
            ['loc' => route('home'), 'priority' => '1.0'],
            ['loc' => route('how-it-works'), 'priority' => '0.9'],
            ['loc' => route('safety'), 'priority' => '0.9'],
            ['loc' => route('features'), 'priority' => '0.8'],
            ['loc' => route('pricing'), 'priority' => '0.8'],
            ['loc' => route('guides.index'), 'priority' => '0.8'],
            ['loc' => route('about'), 'priority' => '0.6'],
            ['loc' => route('faq'), 'priority' => '0.7'],
            ['loc' => route('contact'), 'priority' => '0.4'],
            ['loc' => route('terms'), 'priority' => '0.2'],
            ['loc' => route('privacy'), 'priority' => '0.2'],
        ])->merge(
            collect(config('guides', []))->keys()->map(fn (string $slug) => [
                'loc' => route('guides.show', $slug),
                'priority' => '0.7',
            ])
        );

        $xml = view('sitemap', ['urls' => $urls])->render();

        return response($xml, 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
