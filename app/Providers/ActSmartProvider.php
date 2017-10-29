<?php

namespace App\Providers;

use actsmart\actsmart\Agent;
use actsmart\actsmart\Stores\BaseStore;
use Illuminate\Support\ServiceProvider;
use actsmart\actsmart\Sensors\Slack\SlackSensor;
use actsmart\actsmart\Sensors\Slack\SlackEventCreator;
use Symfony\Component\EventDispatcher\EventDispatcher;
use actsmart\actsmart\Controllers\Slack\URLVerificationController;

class ActSmartProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->singleton('tt.agent', function ($app) {
            $dispatcher = new EventDispatcher();

            $teamtask_agent = new Agent($dispatcher);
            $slack_event_creator = new SlackEventCreator();
            $slack_messages_store = new BaseStore();

            $verification_controller = new URLVerificationController($teamtask_agent, env('SLACK_VERIFICATION_TOKEN'));

            $sensor = new SlackSensor($slack_event_creator, $dispatcher);

            $teamtask_agent->addSensor($sensor);

            $teamtask_agent->bindSensorToStore($sensor, $slack_messages_store);
            $teamtask_agent->bindSensorToController($sensor, $verification_controller);

            return $teamtask_agent;
        });
    }
}
