<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;

class SubmitIndexNow extends Command
{
    protected $signature = 'seo:indexnow';

    protected $description = 'Notify IndexNow of all canonical public URLs';

    public function handle(): int
    {
        if (! config('seo.indexing_enabled')) {
            $this->error('SEO indexing is disabled. Enable it only on the final public domain.');

            return self::FAILURE;
        }

        $key = config('services.indexnow.key');
        if (blank($key)) {
            $this->error('INDEXNOW_KEY is missing.');

            return self::FAILURE;
        }

        $siteUrl = rtrim(config('app.url'), '/');
        $urls = collect([
            route('home'), route('how-it-works'), route('safety'), route('features'),
            route('pricing'), route('guides.index'), route('about'), route('faq'),
            route('contact'), route('terms'), route('privacy'),
        ])->merge(
            collect(config('guides'))->keys()->map(fn (string $slug) => route('guides.show', $slug))
        )->values()->all();

        $response = Http::timeout(15)->post('https://api.indexnow.org/indexnow', [
            'host' => parse_url($siteUrl, PHP_URL_HOST),
            'key' => $key,
            'keyLocation' => $siteUrl.'/indexnow-key.txt',
            'urlList' => $urls,
        ]);

        if (! $response->successful()) {
            $this->error('IndexNow refused the submission (HTTP '.$response->status().').');

            return self::FAILURE;
        }

        $this->info(count($urls).' public URLs submitted to IndexNow.');

        return self::SUCCESS;
    }
}
