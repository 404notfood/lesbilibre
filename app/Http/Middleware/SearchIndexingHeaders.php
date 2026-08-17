<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SearchIndexingHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $routeName = $request->route()?->getName();
        $isPublic = in_array($routeName, config('seo.public_routes', []), true);
        $indexable = config('seo.indexing_enabled', false) && $isPublic;

        $response->headers->set(
            'X-Robots-Tag',
            $indexable ? 'index, follow' : 'noindex, nofollow, noarchive'
        );

        return $response;
    }
}
