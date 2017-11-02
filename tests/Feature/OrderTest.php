<?php

namespace Tests\Feature;

use ApiTestTrait;
use App\Order;
use App\Repositories\OrderRepository;
use App\User;
use Illuminate\Foundation\Testing\Concerns\MakesHttpRequests;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Support\Debug\Dumper;
use Illuminate\Support\Facades\App;
use Tests\TestCase;

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
        $this->assertModelData($order['fulfillmentData'], $createdOrder['fulfillmentData']);
        $this->assertModelData($order['orderItem'], $createdOrder['orderItem']);
        $this->assertModelData($order, $createdOrder);
    }

    public function testReadOrder()
    {
        $order = factory(Order::class)->raw();
        $createdOrder = $this->orderRepo->create($order);
        $response = $this->json('GET', '/order/'.$createdOrder->id);
        $response->assertSuccessful(['id']);
    }

    public function testUpdateOrder()
    {
        $this->assertTrue(false);
    }

    private function createOrder()
    {
        return factory(Order::class)->create();
    }
}
