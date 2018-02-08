<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Hash;

class AuthToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $authorized = false;
        if ($request->has('token')) {
            $authorized = $this->authToken($request->token);
        }
        else {
            $authorized = $this->auth($request->u, $request->p);
        }
        if ($authorized == false) {
        }
        return $next($request);
    }

    private function auth($user, $password)
    {
        $usernameHash = hash('sha256',$user . env('APP_KEY'));
        $passwordHash = hash('sha256',$password . env('APP_KEY'));

        $comparedHash = hash('sha256',$usernameHash . $passwordHash . env('APP_KEY'));
        $savedHash = hash('sha256', env('AUTH_TOKEN') . env('APP_KEY'));
        if($comparedHash != $savedHash || $comparedHash == null){
            abort(403, "Unauthorized User");
        }
        return true;
    }

    private function authToken($token)
    {
        $comparedHash = hash('sha256', $token . env('APP_KEY'));
        $savedHash = hash('sha256', env('AUTH_TOKEN') . env('APP_KEY'));
        if($comparedHash != $savedHash || $comparedHash == null){
            abort(403, "Unauthorized Token");
        }
        return true;
    }
}
