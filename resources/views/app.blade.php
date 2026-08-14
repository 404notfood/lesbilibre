<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <title inertia>{{ config('app.name', 'LesbiLibre') }}</title>

        @php
            $siteUrl = rtrim(config('app.url', 'https://steff.404notfood.fr'), '/');
            $brandDescription = 'LesbiLibre, la plateforme de rencontres sincères pensée pour les femmes qui aiment les femmes.';
            $socialImage = $siteUrl . '/images/branding/lesbilibre-social-1200x630.png';
        @endphp

        <meta name="description" content="{{ $brandDescription }}">
        <link rel="canonical" href="{{ $siteUrl . request()->getPathInfo() }}">
        <meta property="og:locale" content="fr_FR">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="LesbiLibre">
        <meta property="og:title" content="LesbiLibre — Aimer une femme, sans détour.">
        <meta property="og:description" content="{{ $brandDescription }}">
        <meta property="og:url" content="{{ $siteUrl . request()->getPathInfo() }}">
        <meta property="og:image" content="{{ $socialImage }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="LesbiLibre — Aimer une femme, sans détour.">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="LesbiLibre — Aimer une femme, sans détour.">
        <meta name="twitter:description" content="{{ $brandDescription }}">
        <meta name="twitter:image" content="{{ $socialImage }}">

        <link rel="icon" href="/favicon-lesbilibre.ico" sizes="any">
        <link rel="icon" href="/images/branding/icon-32.png" type="image/png" sizes="32x32">
        <link rel="icon" href="/images/branding/icon-16.png" type="image/png" sizes="16x16">
        <link rel="icon" href="/images/branding/icon-192.png" type="image/png" sizes="192x192">
        <link rel="apple-touch-icon" href="/apple-touch-icon-lesbilibre.png" sizes="180x180">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        <meta name="apple-mobile-web-app-title" content="LesbiLibre">
        <link rel="manifest" href="/manifest.json">
        <meta name="theme-color" content="#170b10">

        <script type="application/ld+json">
            {!! json_encode([
                '@context' => 'https://schema.org',
                '@type' => 'Organization',
                'name' => 'LesbiLibre',
                'url' => $siteUrl,
                'logo' => $siteUrl . '/images/branding/icon-512.png',
                'image' => $socialImage,
                'description' => $brandDescription,
                'areaServed' => 'FR',
                'inLanguage' => 'fr-FR',
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
