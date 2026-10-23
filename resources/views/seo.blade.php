<title inertia>{{ $seo['title'] }}</title>
<meta inertia="robots" name="robots" content="{{ $seo['robots'] }}">
<meta inertia="description" name="description" content="{{ $seo['description'] }}">
@if ($seo['canonical'])
    <link inertia="canonical" rel="canonical" href="{{ $seo['canonical'] }}">
@endif
@foreach ([
    'og:locale' => 'fr_FR',
    'og:type' => 'website',
    'og:site_name' => 'LesbiLibre',
    'og:title' => $seo['title'],
    'og:description' => $seo['description'],
    'og:url' => $seo['url'],
    'og:image' => $seo['image'],
    'og:image:width' => '1200',
    'og:image:height' => '630',
    'og:image:alt' => 'LesbiLibre — Aimer une femme, sans détour.',
] as $property => $content)
    <meta inertia="{{ $property }}" property="{{ $property }}" content="{{ $content }}">
@endforeach
@foreach ([
    'twitter:card' => 'summary_large_image',
    'twitter:title' => $seo['title'],
    'twitter:description' => $seo['description'],
    'twitter:image' => $seo['image'],
] as $name => $content)
    <meta inertia="{{ $name }}" name="{{ $name }}" content="{{ $content }}">
@endforeach
<script inertia="structured-data" type="application/ld+json">{!! json_encode($seo['schema'], JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR) !!}</script>
