<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                // La landing publique est toujours en dark : l'appliquer ici, avant
                // le premier rendu, évite un flash où le header sombre devient
                // illisible sur le hero (le useEffect de la page arrive trop tard).
                if (window.location.pathname === '/') {
                    document.documentElement.classList.add('dark');

                    return;
                }

                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Fond de page appliqué avant le CSS compilé, pour éviter un flash
             blanc au chargement. Les teintes reprennent --bg de app.css : un
             blanc pur ici trahirait le thème dès que la page dépasse la
             hauteur de la fenêtre. --}}
        <style>
            html {
                background-color: oklch(96.5% 0.013 60);
            }

            html.dark {
                background-color: oklch(14% 0.025 350);
            }

            html,
            body {
                min-height: 100%;
            }
        </style>

        @php
            $siteUrl = rtrim(config('app.url', 'https://steff.404notfood.fr'), '/');
            $routeName = request()->route()?->getName();
            $isPublicRoute = in_array($routeName, config('seo.public_routes', []), true);
            $isIndexable = config('seo.indexing_enabled', false) && $isPublicRoute;
            $routeSeo = config("seo.pages.{$routeName}", config('seo.default'));
            $pageSeo = $page['props']['seo'] ?? [];
            $seoTitle = $pageSeo['title'] ?? $routeSeo['title'] ?? config('seo.default.title');
            $brandDescription = $pageSeo['description'] ?? $routeSeo['description'] ?? config('seo.default.description');
            $canonicalUrl = $siteUrl . request()->getPathInfo();
            $socialImage = $siteUrl . '/images/branding/lesbilibre-social-1200x630.png';

            $schemaGraph = [
                [
                    '@type' => 'Organization',
                    '@id' => $siteUrl . '/#organization',
                    'name' => 'LesbiLibre',
                    'url' => $siteUrl,
                    'logo' => $siteUrl . '/images/branding/icon-512.png',
                    'description' => config('seo.default.description'),
                ],
                [
                    '@type' => 'WebSite',
                    '@id' => $siteUrl . '/#website',
                    'name' => 'LesbiLibre',
                    'url' => $siteUrl,
                    'inLanguage' => 'fr-FR',
                    'publisher' => ['@id' => $siteUrl . '/#organization'],
                ],
            ];

            if ($routeName === 'home') {
                $schemaGraph[] = [
                    '@type' => 'SoftwareApplication',
                    'name' => 'LesbiLibre',
                    'applicationCategory' => 'LifestyleApplication',
                    'operatingSystem' => 'Web',
                    'url' => $siteUrl,
                    'description' => $brandDescription,
                ];
            }

            if (isset($page['props']['structuredData'])) {
                $schemaGraph[] = $page['props']['structuredData'] + [
                    'url' => $canonicalUrl,
                    'inLanguage' => 'fr-FR',
                    'publisher' => ['@id' => $siteUrl . '/#organization'],
                ];
            }
        @endphp

        <title inertia>{{ $seoTitle }}</title>
        <meta name="robots" content="{{ $isIndexable ? 'index, follow' : 'noindex, nofollow, noarchive' }}">
        <meta name="description" content="{{ $brandDescription }}">
        @if ($isPublicRoute)
            <link rel="canonical" href="{{ $canonicalUrl }}">
        @endif
        <meta property="og:locale" content="fr_FR">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="LesbiLibre">
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:description" content="{{ $brandDescription }}">
        <meta property="og:url" content="{{ $canonicalUrl }}">
        <meta property="og:image" content="{{ $socialImage }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="LesbiLibre — Aimer une femme, sans détour.">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        <meta name="twitter:description" content="{{ $brandDescription }}">
        <meta name="twitter:image" content="{{ $socialImage }}">

        <link rel="icon" href="/favicon-lesbilibre.ico" sizes="any">
        <link rel="icon" href="/images/branding/icon-32.png" type="image/png" sizes="32x32">
        <link rel="icon" href="/images/branding/icon-16.png" type="image/png" sizes="16x16">
        <link rel="icon" href="/images/branding/icon-192.png" type="image/png" sizes="192x192">
        <link rel="apple-touch-icon" href="/apple-touch-icon-lesbilibre.png" sizes="180x180">
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="LesbiLibre">
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#170b10">

        <script type="application/ld+json">
            {!! json_encode([
                '@context' => 'https://schema.org',
                '@graph' => $schemaGraph,
            ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) !!}
        </script>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
