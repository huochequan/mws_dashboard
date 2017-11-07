<?php

use Faker\Factory as Faker;
use App\Models\OrderItem;
use App\Repositories\OrderItemRepository;

trait MakeOrderItemTrait
{
    /**
     * Create fake instance of OrderItem and save it in database
     *
     * @param array $orderItemFields
     * @return OrderItem
     */
    public function makeOrderItem($orderItemFields = [])
    {
        /** @var OrderItemRepository $orderItemRepo */
        $orderItemRepo = App::make(OrderItemRepository::class);
        $theme = $this->fakeOrderItemData($orderItemFields);
        return $orderItemRepo->create($theme);
    }

    /**
     * Get fake instance of OrderItem
     *
     * @param array $orderItemFields
     * @return OrderItem
     */
    public function fakeOrderItem($orderItemFields = [])
    {
        return new OrderItem($this->fakeOrderItemData($orderItemFields));
    }

    /**
     * Get fake data of OrderItem
     *
     * @param array $postFields
     * @return array
     */
    public function fakeOrderItemData($orderItemFields = [])
    {
        $fake = Faker::create();

        return array_merge([
            'order_id' => $fake->randomDigitNotNull,
            'aSIN' => $fake->word,
            'sKU' => $fake->word,
            'itemStatus' => $fake->word,
            'productName' => $fake->word,
            'quantity' => $fake->randomDigitNotNull,
            'itemPrice' => $fake->text,
            'created_at' => $fake->date('Y-m-d H:i:s'),
            'updated_at' => $fake->date('Y-m-d H:i:s')
        ], $orderItemFields);
    }
}
