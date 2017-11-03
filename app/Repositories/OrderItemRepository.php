<?php

namespace App\Repositories;

use App\Models\OrderItem;
use InfyOm\Generator\Common\BaseRepository;

/**
 * Class OrderItemRepository
 * @package App\Repositories
 * @version November 2, 2017, 10:58 pm UTC
 *
 * @method OrderItem findWithoutFail($id, $columns = ['*'])
 * @method OrderItem find($id, $columns = ['*'])
 * @method OrderItem first($columns = ['*'])
*/
class OrderItemRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'order_id',
        'aSIN',
        'sKU',
        'itemStatus',
        'productName',
        'quantity',
        'itemPrice'
    ];

    /**
     * Configure the Model
     **/
    public function model()
    {
        return OrderItem::class;
    }
}
