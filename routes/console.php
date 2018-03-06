<?php

use App\Order;
use App\Repositories\OrderAPIDataRepository;
use App\Services\Trevco\NextSellerCacheManager;
use Carbon\Carbon;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;

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
    $exitCode = Artisan::call('trevco:update-unshipped-order-count');
    $exitCode = Artisan::call('trevco:update-unshipped-order-count');
    $exitCode = Artisan::call('trevco:update-unshipped-order-count');
})->describe('Update Sales figures');

Artisan::command('trevco:update-unshipped-order-count {seller?}', function ($seller=null) {
	$seller = $seller ? $seller : (new NextSellerCacheManager('unshippedCount'))->getNextSeller();
	if ($seller != 'walmart') {
		$amazonOrderListClient = new AmazonOrderList('default', false, null, config_path($seller.'.php'));
		$amazonOrderListClient->setLimits('Created', '- 30 days');
		$amazonOrderListClient->setFulfillmentChannelFilter("MFN");
		$amazonOrderListClient->setOrderStatusFilter(["Unshipped", "PartiallyShipped"]);
		$amazonOrderListClient->setUseToken();
		$amazonOrderListClient->fetchOrders();
		$salesDataInfo = [];
		if (Cache::has('salesDataInfo')) {
			$salesDataInfo = Cache::get('salesDataInfo');
		}
		if(!isset($salesDataInfo['unshippedCount']) || !is_array($salesDataInfo['unshippedCount']) ) { 
			$salesDataInfo['unshippedCount'] = [];
		}
		$salesDataInfo['unshippedCount'][$seller] = count($amazonOrderListClient->getList());
	    Cache::forget('salesDataInfo');
	    Cache::put('salesDataInfo', $salesDataInfo, 60);		
	} else {
		// Walmart unshippedCount code. TODO
	}
})->describe('Display an inspiring quote');

Artisan::command('trevco:prune-order-data', function () {
	Order::whereDate('purchaseDate', '<', Carbon::now()->tz('America/Los_Angeles')->subDays(61)->toDateString())->delete();
})->describe('Prune all orders unnecessary for calculations');

Artisan::command('trevco:empty-reports-folder', function () {collect(Storage::disk('local')->files('amazon-mws/reports'))->map(function($file){
		Storage::disk('local')->delete($file);
	});
})->describe('Empty amazon mws report folder');

Artisan::command('trevco:sync-walmart-orders', function ()
{
    echo exec(trim("php walmart_sync/artisan trevco:sync-walmart-orders"));
})->describe('Sync latest orders off Walmart storefront');
