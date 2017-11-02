<?php

namespace App\Repositories;

use App\Order;
use InfyOm\Generator\Common\BaseRepository;

/**
 * Class OrderRepository
 * @package App\Repositories
 * @version November 2, 2017, 8:33 pm UTC
 *
 * @method Order findWithoutFail($id, $columns = ['*'])
 * @method Order find($id, $columns = ['*'])
 * @method Order first($columns = ['*'])
*/
class OrderRepository extends BaseRepository
{
    /**
     * @var array
     */
    protected $fieldSearchable = [
        'amazonOrderID',
        'merchantOrderID',
        'purchaseDate',
        'lastUpdatedDate',
        'orderStatus',
        'salesChannel',
        'fulfillmentData',
        'isBusinessOrder'
    ];

    /**
     * Configure the Model
     **/
    public function model()
    {
        return Order::class;
    }
}
