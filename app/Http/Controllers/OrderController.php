<?php

namespace App\Http\Controllers;

use App\Http\Controllers\AppBaseController;
use App\Http\Requests\API\CreateOrderAPIRequest;
use App\Http\Requests\API\UpdateOrderAPIRequest;
use App\Order;
use App\Repositories\OrderRepository;
use Carbon\Carbon;
use Illuminate\Http\Request;
use InfyOm\Generator\Criteria\LimitOffsetCriteria;
use Prettus\Repository\Criteria\RequestCriteria;
use Response;
use Illuminate\Support\Facades\Cache;

class OrderController extends AppBaseController
{
    /** @var  OrderRepository */
    private $orderRepository;

    public function __construct(OrderRepository $orderRepo)
    {
        $this->orderRepository = $orderRepo;
    }

    /**
     * Display a listing of the resource.
     * GET|HEAD /orders
     *
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        ini_set('max_execution_time', 0);
        $salesDataInfo = Cache::remember('salesDataInfo', 15, function () {
            $saleDaysRange = date_range(Carbon::now()->tz('America/Los_Angeles')->subDays(29)->startOfDay(), Carbon::now()->tz('America/Los_Angeles')->endOfDay());
            $salesLast30Days = 0;
            $salesToday = 0;
            $today = Carbon::now()->tz('America/Los_Angeles')->toDateString();
            $unshippedCount = 0;
            $saleDaysData = array_map(function ($day) use (&$salesLast30Days, &$salesToday, &$salesYesterday, &$unshippedCount)
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
        $salesLast30Days = $salesDataInfo['salesLast30Days'];
        $salesToday = $salesDataInfo['salesToday'];
        $salesYesterday = $salesDataInfo['salesYesterday'];
        $unshippedCount = $salesDataInfo['unshippedCount'];
        $saleDaysData = $salesDataInfo['saleDaysData'];
        $ordersToday = $salesDataInfo['ordersToday'];

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
        return $this->sendResponse(compact('saleDaysData', 'salesLast30Days','salesPrevious30Days', 'salesToday', 'salesYesterday', 'ordersToday', 'unshippedCount'), 'Orders retrieved successfully');
    }

    /**
     * Store a newly created Order in storage.
     * POST /orders
     *
     * @param CreateOrderAPIRequest $request
     *
     * @return Response
     */
    public function store(CreateOrderAPIRequest $request)
    {
        $input = $request->all();

        $orders = $this->orderRepository->create($input);

        return $this->sendResponse($orders->toArray(), 'Order saved successfully');
    }

    /**
     * Display the specified Order.
     * GET|HEAD /orders/{id}
     *
     * @param  int $id
     *
     * @return Response
     */
    public function show($id)
    {
        /** @var Order $order */
        $order = $this->orderRepository->findWithoutFail($id);

        if (empty($order)) {
            return $this->sendError('Order not found');
        }

        return $this->sendResponse($order->toArray(), 'Order retrieved successfully');
    }

    /**
     * Update the specified Order in storage.
     * PUT/PATCH /orders/{id}
     *
     * @param  int $id
     * @param UpdateOrderAPIRequest $request
     *
     * @return Response
     */
    public function update($id, UpdateOrderAPIRequest $request)
    {
        $input = $request->all();

        /** @var Order $order */
        $order = $this->orderRepository->findWithoutFail($id);

        if (empty($order)) {
            return $this->sendError('Order not found');
        }

        $order = $this->orderRepository->update($input, $id);

        return $this->sendResponse($order->toArray(), 'Order updated successfully');
    }

    /**
     * Remove the specified Order from storage.
     * DELETE /orders/{id}
     *
     * @param  int $id
     *
     * @return Response
     */
    public function destroy($id)
    {
        /** @var Order $order */
        $order = $this->orderRepository->findWithoutFail($id);

        if (empty($order)) {
            return $this->sendError('Order not found');
        }

        $order->delete();

        return $this->sendResponse($id, 'Order deleted successfully');
    }
}
