<?php

use App\Order;
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
    $salesPrevious30Days = Cache::remember('salesPrevious30Days', 1200, function () {
        $salesPrevious30Days = 0;
        foreach(Order::whereBetween('purchaseDate', [Carbon::now()->subDays(60)->toDateString(), Carbon::now()->subDays(31)->toDateString()])->cursor() as $order) {
            $salesPrevious30Days += $order->total;
        }
        return $salesPrevious30Days;
    });        
})->describe('Calculate and cache sales figures for previous 30 days');

Artisan::command('trevco:update-sales-data', function () {
    $salesDataInfo = Cache::remember('salesDataInfo', 15, function () {
        $saleDaysRange = date_range(Carbon::now()->subDays(29)->startOfDay(), Carbon::now()->endOfDay());
        $salesLast30Days = 0;
        $salesToday = 0;
        $salesYesterday = 0;
        $today = Carbon::now()->toDateString();
        $unshippedCount = 0;
        $saleDaysData = array_map(function ($day) use (&$salesLast30Days, &$salesToday, &$salesYesterday, &$unshippedCount)
        {
            $dayFBASales = 0;
            $dayFBMSales = 0;
            foreach (Order::where('purchaseDate', $day->toDateString())->cursor() as $order) {
                $dayFBASales += ($order->fulfillmentData['fulfillmentChannel'] == "Amazon") ? $order->total :  0;
                $dayFBMSales += ($order->fulfillmentData['fulfillmentChannel'] == "Merchant") ? $order->total: 0;
                $unshippedCount += (($order->fulfillmentData['fulfillmentChannel'] == "Merchant") && ($order->orderStatus != "Shipped")) ? 1 : 0;
            }
            $salesLast30Days += $dayFBMSales + $dayFBASales;

            if (Carbon::now()->toDateString() == $day->toDateString()) {
                $salesToday += $dayFBMSales + $dayFBASales;
            }
            $salesToday += (Carbon::now()->toDateString() == $day->toDateString())? $dayFBMSales + $dayFBASales : 0;
            $salesYesterday += (Carbon::yesterday()->toDateString() == $day->toDateString())? $dayFBMSales + $dayFBASales : 0;
            return ['purchaseDate' => $day->format('M d'), 'dayFBASales' => $dayFBASales, 'dayFBMSales' => $dayFBMSales];
        },$saleDaysRange);
        return compact('salesLast30Days', 'salesToday', 'salesYesterday', 'unshippedCount', 'saleDaysData');
    });
})->describe('Update Sales figures');
