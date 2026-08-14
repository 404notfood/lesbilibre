<?php

namespace App\Http\Middleware;

use App\Services\GemService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GrantDailyLoginBonus
{
    public function __construct(private GemService $gemService) {}

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user()) {
            // Try to grant daily login bonus
            $this->gemService->grantDailyLoginBonus($request->user());
        }

        return $next($request);
    }
}
