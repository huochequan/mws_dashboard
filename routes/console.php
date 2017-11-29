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
        foreach(Order::whereBetween('purchaseDate', [Carbon::now()->tz('America/Los_Angeles')->subDays(60)->toDateString(), Carbon::now()->tz('America/Los_Angeles')->subDays(31)->toDateString()])->cursor() as $order) {
            if ($order->orderStatus == "Cancelled") {
                $order->delete();
                continue;
            }
            $salesPrevious30Days += $order->total;
        }
        return $salesPrevious30Days;
    });        
})->describe('Calculate and cache sales figures for previous 30 days');

Artisan::command('trevco:update-sales-data', function () {
    $salesDataInfo = Cache::remember('salesDataInfo', 15, function () {
        $saleDaysRange = date_range(Carbon::now()->tz('America/Los_Angeles')->subDays(29)->startOfDay(), Carbon::now()->tz('America/Los_Angeles')->endOfDay());
        $salesLast30Days = 0;
        $salesToday = 0;
        $today = Carbon::now()->tz('America/Los_Angeles')->toDateString();
        $unshippedCount = 0;
        $saleDaysData = array_map(function ($day) use (&$salesLast30Days, &$salesToday, &$unshippedCount)
        {
            $dayFBASales = 0;
            $dayFBMSales = 0;
            foreach (Order::whereDate('purchaseDate', $day->toDateString())->cursor() as $order) {
                if ($order->orderStatus == "Cancelled") {
                    $order->delete();
                    continue;
                }
                $dayFBASales += ($order->fulfillmentData['fulfillmentChannel'] == "Amazon") ? $order->total :  0;
                $dayFBMSales += ($order->fulfillmentData['fulfillmentChannel'] == "Merchant") ? $order->total: 0;
                $unshippedCount += (($order->fulfillmentData['fulfillmentChannel'] == "Merchant") && ($order->orderStatus != "Shipped")) ? 1 : 0;
            }
            $salesLast30Days += $dayFBMSales + $dayFBASales;

            if (Carbon::now()->tz('America/Los_Angeles')->toDateString() == $day->toDateString()) {
                $salesToday += $dayFBMSales + $dayFBASales;
            }
            return ['purchaseDate' => $day->format('M d'), 'dayFBASales' => $dayFBASales, 'dayFBMSales' => $dayFBMSales];
        },$saleDaysRange);
        // Calculate sales yesterday at this point in the day
        $salesYesterday = 0;
        foreach (Order::whereBetween('purchaseDate', [Carbon::now()->tz('America/Los_Angeles')->subDays(1)->startOfDay()->toDateTimeString(), Carbon::now()->tz('America/Los_Angeles')->subDays(1)->toDateTimeString()])->cursor() as $order) {
            if ($order->orderStatus == "Cancelled") {
                $order->delete();
                continue;
            }
            $salesYesterday += $order->total;
        }

        $ordersToday = Order::whereDate('purchaseDate', Carbon::now()->tz('America/Los_Angeles')->toDateString())->count();
        return compact('salesLast30Days', 'salesToday', 'salesYesterday', 'unshippedCount', 'saleDaysData', 'ordersToday');
    });
})->describe('Update Sales figures');
