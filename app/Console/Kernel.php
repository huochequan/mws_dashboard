<?php

namespace App\Console;

use App\Console\Commands\OrderSyncService;
use Carbon\Carbon;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        OrderSyncService::class
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('trevco:sync-orders')->everyTenMinutes();
        $schedule->command('trevco:calculate-previous30')->hourly();
        $schedule->command('trevco:sync-orders --start=' . Carbon::now()->tz('America/Los_Angeles')->subDays(30)->format('d-m-Y') . ' --end=' . Carbon::now()->tz('America/Los_Angeles')->format('d-m-Y'))->timezone('America/Los_Angeles')->dailyAt('02:00');
        $schedule->command('trevco:sync-orders --start=' . Carbon::now()->tz('America/Los_Angeles')->subDays(60)->format('d-m-Y') . ' --end=' . Carbon::now()->tz('America/Los_Angeles')->subDays(31)->format('d-m-Y'))->timezone('America/Los_Angeles')->dailyAt('03:00');
    }

    /**
     * Register the Closure based commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        require base_path('routes/console.php');
    }
}
