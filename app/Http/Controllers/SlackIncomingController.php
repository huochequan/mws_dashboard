<?php

namespace App\Http\Controllers;

use actsmart\actsmart\Agent;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SlackIncomingController extends Controller
{
    public function handle(Request $request)
    {

        /* @var $agent actsmart\actsmart\Agent */
        $agent = app('tt.agent');
        $agent->sensorReceive('SlackSensor', $request);
        /* @var  Response $response */
        $agent->httpReact()->send();
    }
}
