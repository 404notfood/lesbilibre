<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
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

        @inertiaHead
        @unless ($__inertiaSsrResponse)
            @include('seo', ['seo' => $page['props']['seo']])
        @endunless

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

        <link rel="preload" href="/fonts/fraunces-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
        <link rel="preload" href="/fonts/inter-tight-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>

        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
