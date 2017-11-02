<?php

namespace Tests\Feature;

use App\Order;
use App\User;
use Illuminate\Foundation\Testing\Concerns\MakesHttpRequests;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class OrderTest extends TestCase
{
    use DatabaseMigrations, DatabaseTransactions, MakesHttpRequests;

    public function setUp()
    {
        parent::setUp();
    }

    public function testCreateOrder()
    {
        // $orderRequest = factory(Order::class)->raw();
        // $response = $this->json('POST', '/order/', $orderRequest);
        // $response->assertSuccessful();
        $this->assertTrue(false);
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

    private function createOrder()
    {
        return factory(Order::class)->create();
    }
}
