<?php

namespace App\Console\Commands;

use App\Services\Trevco\AmazonReportTransformer;
use App\Services\Trevco\AmazonSync\AmazonOrderSyncService;
use App\Services\Trevco\AmazonSync\AmazonReportModelSync;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class OrderSyncService extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'trevco:sync-orders {--start= : Starting date or report [DD-MM-YYYY]} {--end= : End date or report [DD-MM-YYYY]}';
    // protected $signature = 'trevco:sync-orders {days_past}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync latest orders off integrated storefronts';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
        $this->reportTransformer = new AmazonReportTransformer();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        if (is_service_running("trevco:")) {
            return 0;
        }
        $dateRange = [];
        $dateRange['startDate'] = $this->option('start') ? $this->option('start') : null;
        $dateRange['endDate'] = $this->option('end') ? $this->option('end') : null;

        $persistenceService = new AmazonReportModelSync($this->reportTransformer);
        $service = new AmazonOrderSyncService($persistenceService, $dateRange);
        $service->execute($this->input, $this->output);

        $exitCode = Artisan::call('trevco:update-sales-data');
    }
}
