<?php

namespace App\Services;

use App\Models\Setting;

class SeoSettings
{
    public function indexingEnabled(): bool
    {
        return (bool) Setting::get('seo_indexing_enabled', config('seo.indexing_enabled', false));
    }

    public function publicRobots(): string
    {
        $siteUrl = rtrim(config('app.url'), '/');
        $rules = "Allow: /\nDisallow: /admin\nDisallow: /settings\nDisallow: /dashboard\nDisallow: /profile\nDisallow: /conversations\n";

        return "User-agent: *\n{$rules}\nUser-agent: OAI-SearchBot\n{$rules}\nSitemap: {$siteUrl}/sitemap.xml\n";
    }

    public function robots(): string
    {
        if (! $this->indexingEnabled()) {
            return "User-agent: *\nDisallow: /\n";
        }

        return Setting::get('seo_robots_content') ?: $this->publicRobots();
    }
}
