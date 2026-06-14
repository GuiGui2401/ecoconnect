<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckProfileRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $allowedRoles = collect($roles)
            ->flatMap(fn (string $role) => explode('|', $role))
            ->filter()
            ->values()
            ->all();

        if (! $user || ! in_array($user->profile_type, $allowedRoles, true)) {
            abort(403, 'This action is unauthorized.');
        }

        return $next($request);
    }
}
