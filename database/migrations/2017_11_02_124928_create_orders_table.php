<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrdersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->increments('id');
            $table->string('amazonOrderID')->unique();
            $table->string('merchantOrderID')->unique()->nullable();
            $table->dateTime('purchaseDate');
            $table->dateTime('lastUpdatedDate');
            $table->string('orderStatus');
            $table->string('salesChannel');
            $table->json('fulfillmentData');
            $table->boolean('isBusinessOrder');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('orders');
    }
}
