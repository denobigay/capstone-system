<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\User;

class AuthTokenMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $auth = $request->header('Authorization');
        if (!$auth || !str_starts_with($auth, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        $token = substr($auth, 7);
        $user = User::where('api_token', $token)->first();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // Optionally attach user to request
        $request->attributes->set('auth_user', $user);
        return $next($request);
    }
}


