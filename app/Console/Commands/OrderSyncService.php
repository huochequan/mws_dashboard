<?php

namespace App\Console\Commands;

use App\Services\Trevco\AmazonSync\AmazonOrderSyncService;
use Illuminate\Console\Command;

class OrderSyncService extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'trevco:sync-orders';

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
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $service = new AmazonOrderSyncService();
        $service->execute($this->input, $this->output);
    }
}
