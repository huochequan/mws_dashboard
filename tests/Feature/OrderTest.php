<?php

namespace Tests\Feature;

use App\Order;
use App\Repositories\OrderRepository;
use App\User;
use Illuminate\Foundation\Testing\Concerns\MakesHttpRequests;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Facades\App;
use Tests\TestCase;
use ApiTestTrait;

class OrderTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions, MakesHttpRequests, ApiTestTrait;

    public function setUp()
    {
        parent::setUp();
        $this->orderRepo = App::make(OrderRepository::class);
    }

    public function testCreateOrder()
    {
        $order = factory(Order::class)->raw();
        $createdOrder = $this->orderRepo->create($order);
        $createdOrder = $createdOrder->toArray();
        $this->assertArrayHasKey('id', $createdOrder);
        $this->assertNotNull($createdOrder['id'], 'Created Order must have id specified');
        $this->assertNotNull(Order::find($createdOrder['id']), 'Order with given id must be in DB');
        $this->assertModelData($order, $createdOrder);
    }

    public function testReadOrder()
    {
        $orderRequest = factory(Order::class)->raw();
        $orderFulfillmentData = $orderRequest['fulfillmentData'];
        $orderRequestOrderItems = $orderRequest['orderItem'];
        unset($orderRequest['fulfillmentData']);
        unset($orderRequest['orderItem']);
        $order = Order::create($orderRequest);
        $response = $this->json('GET', '/order/'.$order->id);
        $response->assertSuccessful(['id']);
    }

    public function testUpdateOrder()
    {
        // $order = $this->createOrder();
        // $editedTasklistTemplate = factory(Order::class)->raw();
        // $response = $this->json('PUT', '/order/'.$order->id, $editedTasklistTemplate);
        // $response->assertSuccessful();
        $this->assertTrue(false);
    }

    public function testSavesViaRepository()
    {
    	$this->assertTrue(false);
    }
    private function createOrder()
    {
        return factory(Order::class)->create();
    }
}
