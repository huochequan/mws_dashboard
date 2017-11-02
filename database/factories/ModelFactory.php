<?php

/*
|--------------------------------------------------------------------------
| Model Factories
|--------------------------------------------------------------------------
|
| Here you may define all of your model factories. Model factories give
| you a convenient way to create models for testing and seeding your
| database. Just tell the factory how a default model should look.
|
*/

/** @var \Illuminate\Database\Eloquent\Factory $factory */
$factory->define(App\User::class, function (Faker\Generator $faker) {
    static $password;

    return [
        'name' => $faker->name,
        'email' => $faker->unique()->safeEmail,
        'password' => $password ?: $password = bcrypt('secret'),
        'remember_token' => str_random(10),
    ];
});

$factory->define(App\Order::class, function (Faker\Generator $faker) {

	return [
    	'amazonOrderID' => '111-5574600-0153060',
    	'merchantOrderID' => '111-5574600-0153060',
    	'purchaseDate' => '2017-10-30T20:06:06+00:00',
    	'lastUpdatedDate' => '2017-10-30T20:06:11+00:00',
    	'orderStatus' => 'Pending',
    	'salesChannel' => 'Amazon.com',
    	'fulfillmentData' => [
        	'fulfillmentChannel' => 'Amazon',
        	'shipServiceLevel' => 'SecondDay',
        	'address' => [
            	'city' =>'MIAMI',
            	'state' =>'FL',
            	'postalCode' =>'33195-2855',
            	'country' =>'US',
        	],      
    	],
    	'isBusinessOrder' => 'true',
    	'orderItem' => [
    	0 => [
    	'aSIN' => 'B074G4GB3P',
    	'sKU' => 'JLM106STK-AT-2',
    	'itemStatus' => 'Unshipped',
    	'productName' => 'Justice League Movie DC Comics Emblems T Shirt & Exclusive Stickers (Medium)',
    	'quantity' => '1',
    	'itemPrice' => [
    	'component' => [
    	'type' => 'Principal',
    	'amount' => 15.95,
    	]
    	]
    	],
    	1 => [
    	'aSIN' => 'B0753YQTZR',
    	'sKU' => 'JLM157STK-AT-1',
    	'itemStatus' => 'Unshipped',
    	'productName' => 'Justice League Movie Batman DC Comics Logo T Shirt & Exclusive Stickers (Small)',
    	'quantity' => '1',
    	'itemPrice' => [
    	'component' => [
    	'type' => 'Principal',
    	'amount' => 24.99,
    	]
    	]
    	]
    	]   
    	];
});
