<?php

use Illuminate\Foundation\Testing\WithoutMiddleware;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class OrderItemApiTest extends TestCase
{
    use MakeOrderItemTrait, ApiTestTrait, WithoutMiddleware, DatabaseTransactions;

    /**
     * @test
     */
    public function testCreateOrderItem()
    {
        $orderItem = $this->fakeOrderItemData();
        $this->json('POST', '/api/v1/orderItems', $orderItem);

        $this->assertApiResponse($orderItem);
    }

    /**
     * @test
     */
    public function testReadOrderItem()
    {
        $orderItem = $this->makeOrderItem();
        $this->json('GET', '/api/v1/orderItems/'.$orderItem->id);

        $this->assertApiResponse($orderItem->toArray());
    }

    /**
     * @test
     */
    public function testUpdateOrderItem()
    {
        $orderItem = $this->makeOrderItem();
        $editedOrderItem = $this->fakeOrderItemData();

        $this->json('PUT', '/api/v1/orderItems/'.$orderItem->id, $editedOrderItem);

        $this->assertApiResponse($editedOrderItem);
    }

    /**
     * @test
     */
    public function testDeleteOrderItem()
    {
        $orderItem = $this->makeOrderItem();
        $this->json('DELETE', '/api/v1/orderItems/'.$orderItem->id);

        $this->assertApiSuccess();
        $this->json('GET', '/api/v1/orderItems/'.$orderItem->id);

        $this->assertResponseStatus(404);
    }
}
