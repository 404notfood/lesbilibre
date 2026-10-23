<?php

namespace App\Services;

use Illuminate\Http\Request;

class SeoMetadata
{
    public function forRequest(Request $request): array
    {
        $siteUrl = rtrim(config('app.url'), '/');
        $routeName = $request->route()?->getName();
        $isPublic = in_array($routeName, config('seo.public_routes', []), true);
        $page = config('seo.pages', [])[$routeName] ?? config('seo.default');
        $guide = $routeName === 'guides.show' ? config('guides.'.$request->route('slug')) : null;

        if (is_array($guide)) {
            $page = ['title' => $guide['title'].' | LesbiLibre', 'description' => $guide['description']];
        }

        $canonical = $siteUrl.$request->getPathInfo();
        $graph = [
            [
                '@type' => 'Organization',
                '@id' => $siteUrl.'/#organization',
                'name' => 'LesbiLibre',
                'url' => $siteUrl,
                'logo' => $siteUrl.'/images/branding/icon-512.png',
                'description' => config('seo.default.description'),
            ],
            [
                '@type' => 'WebSite',
                '@id' => $siteUrl.'/#website',
                'name' => 'LesbiLibre',
                'url' => $siteUrl,
                'inLanguage' => 'fr-FR',
                'publisher' => ['@id' => $siteUrl.'/#organization'],
            ],
        ];

        if ($routeName === 'home') {
            $graph[] = [
                '@type' => 'SoftwareApplication',
                'name' => 'LesbiLibre',
                'applicationCategory' => 'LifestyleApplication',
                'operatingSystem' => 'Web',
                'url' => $siteUrl,
                'description' => $page['description'],
            ];
        }

        if (is_array($guide)) {
            $graph[] = [
                '@type' => 'Article',
                'headline' => $guide['title'],
                'description' => $guide['description'],
                'dateModified' => '2026-08-17',
                'author' => ['@type' => 'Organization', 'name' => 'LesbiLibre'],
                'url' => $canonical,
                'inLanguage' => 'fr-FR',
                'publisher' => ['@id' => $siteUrl.'/#organization'],
            ];
        }

        return $page + [
            'isPublic' => $isPublic,
            'robots' => app(SeoSettings::class)->indexingEnabled() && $isPublic ? 'index, follow' : 'noindex, nofollow, noarchive',
            'canonical' => $isPublic ? $canonical : null,
            'url' => $canonical,
            'image' => $siteUrl.'/images/branding/lesbilibre-social-1200x630.png',
            'schema' => ['@context' => 'https://schema.org', '@graph' => $graph],
        ];
    }
}
