<?php

namespace App;

use Eloquent as Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class Order
 * @package App\Models
 * @version November 2, 2017, 8:33 pm UTC
 *
 * @property string amazonOrderID
 * @property string merchantOrderID
 * @property string|\Carbon\Carbon purchaseDate
 * @property string|\Carbon\Carbon lastUpdatedDate
 * @property string orderStatus
 * @property string salesChannel
 * @property string fulfillmentData
 * @property boolean isBusinessOrder
 */
class Order extends Model
{
    use SoftDeletes;

    public $table = 'orders';
    
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';


    protected $dates = ['deleted_at'];


    public $fillable = [
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
     * The attributes that should be casted to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'integer',
        'amazonOrderID' => 'string',
        'merchantOrderID' => 'string',
        'orderStatus' => 'string',
        'salesChannel' => 'string',
        'fulfillmentData' => 'array',
        'isBusinessOrder' => 'boolean'
    ];

    /**
     * Validation rules
     *
     * @var array
     */
    public static $rules = [
        
    ];

    public function setIsBusinessOrderAttribute($value)
    {
        return $this->attributes['isBusinessOrder'] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }

    public function setFulfillmentDataAttribute($fulfillmentData)
    {
        return $this->attributes['fulfillmentData']  = serialize($fulfillmentData);
    }
    
}
