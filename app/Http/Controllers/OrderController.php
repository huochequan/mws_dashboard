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
        // $this->orderRepository->pushCriteria(new RequestCriteria($request));
        // $this->orderRepository->pushCriteria(new LimitOffsetCriteria($request));
        // $orders = $this->orderRepository->all();
        // $ordersPayload = [];
        // Order::chunk(50, function ($orders) use (&$ordersPayload)
        // {
        //     $ordersIDTotalMap = $orders->mapWithKeys(function ($order) {
        //         return [$order->id => $order->total];
        //     })->all();
        //     $ordersArray = $orders->toArray();
        //     foreach ($ordersArray as $key => $value) {
        //         $value['total'] = $ordersIDTotalMap[$value['id']];
        //         $ordersArray[$key] = $value;
        //     }
        //     $ordersPayload = array_merge($ordersPayload, $ordersArray);
        // });

        $saleDaysRange = date_range(Carbon::now()->subDays(30)->startOfDay(), Carbon::now()->endOfDay());
        $salesLast30Days = 0;
        $salesToday = 0;
        $salesYesterday = 0;
        $today = Carbon::now()->toDateString();
        $saleDaysData = array_map(function ($day) use (&$salesLast30Days, &$salesToday, &$salesYesterday)
        {
            $dayFBASales = 0;
            $dayFBMSales = 0;
            foreach (Order::where('purchaseDate', $day->toDateString())->cursor() as $order) {
                $dayFBASales += ($order->fulfillmentData['fulfillmentChannel'] == "Amazon") ? $order->total :  0;
                $dayFBMSales += ($order->fulfillmentData['fulfillmentChannel'] == "Merchant") ? $order->total: 0;
            }
            $salesLast30Days += $dayFBMSales + $dayFBASales;

            if (Carbon::now()->toDateString() == $day->toDateString()) {
                $salesToday += $dayFBMSales + $dayFBASales;
            }
            $salesToday += (Carbon::now()->toDateString() == $day->toDateString())? $dayFBMSales + $dayFBASales : 0;
            $salesYesterday += (Carbon::yesterday()->toDateString() == $day->toDateString())? $dayFBMSales + $dayFBASales : 0;
            return ['purchaseDate' => $day->toDateString(), 'dayFBASales' => $dayFBASales, 'dayFBMSales' => $dayFBMSales];
        },$saleDaysRange);
        $ordersToday = Order::where('purchaseDate', Carbon::today()->toDateString())->count();
        $unshippedCount = Order::where('orderStatus','!=',"Shipped")->count();
        // return $this->sendResponse($ordersPayload, 'Orders retrieved successfully');
        return $this->sendResponse(compact('saleDaysData', 'salesLast30Days', 'salesToday', 'salesYesterday', 'ordersToday', 'unshippedCount'), 'Orders retrieved successfully');

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
