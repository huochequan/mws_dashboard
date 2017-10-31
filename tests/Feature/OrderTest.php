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
        $orderRequest = factory(Order::class)->raw();
        $response = $this->json('POST', '/order/', $orderRequest);
        $response->assertSuccessful();
    }

    public function testReadOrder()
    {
        $order = $this->createOrder();
        $response = $this->json('GET', '/order/'.$order->id);
        $response->assertSuccessful(['id']);
    }

    public function testUpdateOrder()
    {
        $order = $this->createOrder();
        $editedTasklistTemplate = factory(Order::class)->raw();
        $response = $this->json('PUT', '/order/'.$order->id, $editedTasklistTemplate);
        $response->assertSuccessful();
    }

    public function testDeleteOrder()
    {
        $order = $this->createOrder();
        $response = $this->json('DELETE', '/order/'.$order->id);
        $response->assertSuccessful();
        $this->json('GET', '/order/'.$order->id)->assertStatus(400);
    }

    private function createOrder()
    {
        return factory(Order::class)->create();
    }
}
