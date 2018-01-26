<?php

namespace App\Console\Commands;

use App\Services\Trevco\AmazonReportTransformer;
use App\Services\Trevco\AmazonSync\AmazonOrderSyncService;
use App\Services\Trevco\AmazonSync\AmazonReportModelSync;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class OrderSyncService extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'trevco:sync-orders {--start= : Starting date or report [DD-MM-YYYY]} {--end= : End date or report [DD-MM-YYYY]} { --seller=sellerQueue}';
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
        if (is_service_running("trevco")) {
            return 0;
        }
        $dateRange = [];
        $dateRange['startDate'] = $this->option('start') ? $this->option('start') : null;
        $dateRange['endDate'] = $this->option('end') ? $this->option('end') : null;
        $configFile = $this->getNextSellerConfig($this->option('seller'));
        $persistenceService = new AmazonReportModelSync($this->reportTransformer, str_before($configFile,'.php'));
        $service = new AmazonOrderSyncService($persistenceService, $dateRange, $configFile);
        $service->execute($this->input, $this->output);

        $exitCode = Artisan::call('trevco:update-sales-data');
    }

    private function getNextSellerConfig($queueKey)
    {
        $nextSeller = null;
        if (Cache::has($queueKey)) {
            $sellers = Cache::get($queueKey);
            Cache::forget($queueKey);
        }else{
            $sellers = $this->initSellerQueueFromDatabase($queueKey);                
        }
        Cache::rememberForever($queueKey, function () use ($queueKey, &$nextSeller, &$sellers)
        {
            $nextSeller = array_shift($sellers);
            array_push($sellers, $nextSeller);
            return $sellers;
        });

        return $nextSeller . '.php';
    }
    private function initSellerQueueFromDatabase($queueKey)
    {
        return ['popfunk', 'trevco'];
        // TODO
    }
}
