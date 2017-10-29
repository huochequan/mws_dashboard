<?php

namespace App\Http\Controllers\Auth;

use App\User;
use Socialite;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;

class SlackAuthController extends Controller
{
    /**
     * Redirect the user to the Slack authentication page.
     *
     * @return Response
     */
    public function redirectToSlack()
    {
        $scopes = explode(',', env('SLACK_SCOPE'));

        return Socialite::with('slack')->scopes($scopes)->redirect();
    }

    public function handleSlackCallback()
    {
        try {
            $user = Socialite::driver('slack')->user();
        } catch (Exception $e) {
            return Redirect::to('/');
        }

        $authUser = $this->findOrCreateUser($user);

        if ($authUser != false) {
            Auth::login($authUser, true);
        } else {
            return Redirect::to('/');
        }

        return Redirect::to('home');
    }

    /**
     * Return user if exists; create and return if doesn't.
     *
     * @param $slakUser
     * @return User | bool
     */
    private function findOrCreateUser($slackUser)
    {
        if ($authUser = User::where('slack_user_id', $slackUser->id)->first()) {
            return $authUser;
        }

        // If slack id did not match but user with the same email exists we can't handle that now
        if ($authUser = User::where('email', $slackUser->email)->first()) {
            return false;
        }

        return User::create([
                'name' => $slackUser->name,
                'email' => $slackUser->email,
                'slack_user_id' => $slackUser->id,
            ]);
    }
}
