<?php

use App\Models\OrderItem;
use App\Repositories\OrderItemRepository;
use Illuminate\Foundation\Testing\DatabaseTransactions;

class OrderItemRepositoryTest extends TestCase
{
    use MakeOrderItemTrait, ApiTestTrait, DatabaseTransactions;

    /**
     * @var OrderItemRepository
     */
    protected $orderItemRepo;

    public function setUp()
    {
        parent::setUp();
        $this->orderItemRepo = App::make(OrderItemRepository::class);
    }

    /**
     * @test create
     */
    public function testCreateOrderItem()
    {
        $orderItem = $this->fakeOrderItemData();
        $createdOrderItem = $this->orderItemRepo->create($orderItem);
        $createdOrderItem = $createdOrderItem->toArray();
        $this->assertArrayHasKey('id', $createdOrderItem);
        $this->assertNotNull($createdOrderItem['id'], 'Created OrderItem must have id specified');
        $this->assertNotNull(OrderItem::find($createdOrderItem['id']), 'OrderItem with given id must be in DB');
        $this->assertModelData($orderItem, $createdOrderItem);
    }

    /**
     * @test read
     */
    public function testReadOrderItem()
    {
        $orderItem = $this->makeOrderItem();
        $dbOrderItem = $this->orderItemRepo->find($orderItem->id);
        $dbOrderItem = $dbOrderItem->toArray();
        $this->assertModelData($orderItem->toArray(), $dbOrderItem);
    }

    /**
     * @test update
     */
    public function testUpdateOrderItem()
    {
        $orderItem = $this->makeOrderItem();
        $fakeOrderItem = $this->fakeOrderItemData();
        $updatedOrderItem = $this->orderItemRepo->update($fakeOrderItem, $orderItem->id);
        $this->assertModelData($fakeOrderItem, $updatedOrderItem->toArray());
        $dbOrderItem = $this->orderItemRepo->find($orderItem->id);
        $this->assertModelData($fakeOrderItem, $dbOrderItem->toArray());
    }

    /**
     * @test delete
     */
    public function testDeleteOrderItem()
    {
        $orderItem = $this->makeOrderItem();
        $resp = $this->orderItemRepo->delete($orderItem->id);
        $this->assertTrue($resp);
        $this->assertNull(OrderItem::find($orderItem->id), 'OrderItem should not exist in DB');
    }
}
