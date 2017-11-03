<?php

namespace App\Models;

use Eloquent as Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Class OrderItem
 * @package App\Models
 * @version November 2, 2017, 10:58 pm UTC
 *
 * @property \App\Models\Order order
 * @property integer order_id
 * @property string aSIN
 * @property string sKU
 * @property string itemStatus
 * @property string productName
 * @property integer quantity
 * @property string itemPrice
 */
class OrderItem extends Model
{
    use SoftDeletes;

    public $table = 'order_items';
    
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';


    protected $dates = ['deleted_at'];


    public $fillable = [
        'order_id',
        'aSIN',
        'sKU',
        'itemStatus',
        'productName',
        'quantity',
        'itemPrice'
    ];

    /**
     * The attributes that should be casted to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'integer',
        'order_id' => 'integer',
        'aSIN' => 'string',
        'sKU' => 'string',
        'itemStatus' => 'string',
        'productName' => 'string',
        'quantity' => 'integer',
        'itemPrice' => 'string'
    ];

    /**
     * Validation rules
     *
     * @var array
     */
    public static $rules = [
        
    ];

    /**
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     **/
    public function order()
    {
        return $this->belongsTo(\App\Models\Order::class);
    }
}
