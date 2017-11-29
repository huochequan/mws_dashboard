<?php

use App\Order;
use App\Repositories\OrderAPIDataRepository;
use Carbon\Carbon;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Cache;

/*
|--------------------------------------------------------------------------
| Console Routes
|--------------------------------------------------------------------------
|
| This file is where you may define all of your Closure based console
| commands. Each Closure is bound to a command instance allowing a
| simple approach to interacting with each command's IO methods.
|
*/

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->describe('Display an inspiring quote');

Artisan::command('trevco:calculate-previous30', function () {
    $orderApiDataRepo = new OrderAPIDataRepository();
    $salesPrevious30Days = $orderApiDataRepo->getSalesPrevious30Days();
    Cache::forget('salesPrevious30Days');
    Cache::put('salesPrevious30Days', $salesPrevious30Days, 1200);
})->describe('Calculate and cache sales figures for previous 30 days');

Artisan::command('trevco:update-sales-data', function () {
    $orderApiDataRepo = new OrderAPIDataRepository();
    $salesDataInfo = $orderApiDataRepo->getSalesDataInfo();
    Cache::forget('salesDataInfo');
    Cache::put('salesDataInfo', $salesDataInfo, 60);
})->describe('Update Sales figures');
