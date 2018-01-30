<?php
namespace App\Repositories;

use App\Order;
use Carbon\Carbon;
use Symfony\Component\VarDumper\VarDumper;
/**
* 	OrderAPIDataRepository class for sourcing order api data
*/
class OrderAPIDataRepository
{
	public function getSalesDataInfo()
	{
        $saleDaysRange = date_range(Carbon::now()->tz('America/Los_Angeles')->subDays(29)->startOfDay(), Carbon::now()->tz('America/Los_Angeles')->endOfDay());
        $salesLast30Days = 0;
        $salesToday = 0;
        $today = Carbon::now()->tz('America/Los_Angeles')->toDateString();
        $unshippedCount = 0;
        $saleDaysData = array_map(function ($day) use (&$salesLast30Days, &$salesToday, &$unshippedCount)
        {
            // For each day calculate fbmsales and fbasales.
            $sellers = $this->getSellers();
            $sales = [];
            foreach ($sellers as $s) {
                $dayFBASales = 0;
                $dayFBMSales = 0;
                // get seller sales data. append to day sales array
                $seller = $s['seller'];
                foreach (Order::whereDate('purchaseDate', $day->toDateString())->where('sellerID', $s['id'])->cursor() as $order) {
                    if ($order->orderStatus == "Cancelled") {
                        $order->delete();
                        continue;
                    }
                    $dayFBASales += ($order->fulfillmentData['fulfillmentChannel'] == "Amazon") ? $order->total :  0;
                    $dayFBMSales += ($order->fulfillmentData['fulfillmentChannel'] == "Merchant") ? $order->total: 0;
                    // unshippedCount should include ALL Sales
                    $unshippedCount += (($order->fulfillmentData['fulfillmentChannel'] == "Merchant") && ($order->orderStatus != "Shipped")) ? 1 : 0;
                }
                    $salesLast30Days += $dayFBMSales + $dayFBASales;

                    if (Carbon::now()->tz('America/Los_Angeles')->toDateString() == $day->toDateString()) {
                        // Sales today should include all sellers
                        $salesToday += $dayFBMSales + $dayFBASales;
                    }
                    $sales[] = compact('seller', 'dayFBASales','dayFBMSales');
            }

            // salesLast30Days should include ALL Sales
            // VarDumper::dump(['purchaseDate' => $day->format('M d'), compact('sales')]);

            // return ['purchaseDate' => $day->format('M d'), 'dayFBASales' => $dayFBASales, 'dayFBMSales' => $dayFBMSales];
            return ['purchaseDate' => $day->format('M d'), 'sales' => $sales];

/* 
            return ['purchaseDate' => $day->format('M d'), 'sales' => ['seller' => $seller , 'dayFBASales' => $dayFBASales, 'dayFBMSales' => $dayFBMSales]];
*/
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
	}

	public function getSalesPrevious30Days()
	{
        $salesPrevious30Days = 0;
        foreach(Order::whereBetween('purchaseDate', [Carbon::now()->tz('America/Los_Angeles')->subDays(60)->toDateString(), Carbon::now()->tz('America/Los_Angeles')->subDays(31)->toDateString()])->cursor() as $order) {
            if ($order->orderStatus == "Cancelled") {
                $order->delete();
                continue;
            }
            $salesPrevious30Days += $order->total;
        }
        return $salesPrevious30Days;		
	}

    private function getSellerID($seller)
    {
        $sellers = [
            [
                'id' => 1,
                'seller' => 'popfunk'
            ],
            [
                'id' => 2,
                'seller' => 'trevco'
            ]
        ];
        if (!$sellers) {
            return null;
        }
        return array_first($sellers, function ($value) use ($seller)
        {
            return $value['seller'] == $seller;
        })['id'];
    }
    private function getSellers()
    {
        return [
                    [
                        'id' => 1,
                        'seller' => 'popfunk'
                    ],
                    [
                        'id' => 2,
                        'seller' => 'trevco'
                    ]
                ];
    }
}