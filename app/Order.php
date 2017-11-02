<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{

    public $fillable = [
    	'amazonOrderID',
    	'merchantOrderID',
    	'purchaseDate',
    	'lastUpdatedDate',
    	'orderStatus',
    	'isBusinessOrder',
    	'salesChannel',
    ];

    public function setIsBusinessOrderAttribute($value)
    {
    	return $this->attributes['isBusinessOrder'] = filter_var($value, FILTER_VALIDATE_BOOLEAN);
    }
}
