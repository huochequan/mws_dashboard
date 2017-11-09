<?php
namespace App\Services\Trevco\AmazonSync;

use App\Repositories\OrderRepository;
use App\Services\Trevco\AmazonReportTransformer;
use Exception;
use ReflectionClass;

class AmazonReportModelSync
{
	protected $reportTransformer;
	function __construct(AmazonReportTransformer $reportTransformer)
	{
		$this->reportTransformer = $reportTransformer;
	}
	public function saveModels($modelName, $reportData)
	{
		$model = \App::make($modelName);
		$dataType = (new ReflectionClass($model))->getShortName();
		$batchSaveMethod = 'batchSave'.$dataType;
		$modelsArray = $this->reportTransformer->getArrayFromPayload($dataType, $reportData);
		$this->$batchSaveMethod($modelsArray);
	}

	private function batchSaveOrder($orders)
	{
		foreach ($orders as $order) {

	        $orderItems = array_get($order, 'orderItem');
	        $createdOrder = \App::make(OrderRepository::class)->updateOrCreate(array_only($order, ['amazonOrderID', 'merchantOrderID']),array_except($order, ['orderItem']));

        	$createdOrder->orderItem()->delete();
	        if (empty($orderItems[0])) {
	        	$createdOrder->orderItem()->create($orderItems);
	        }
	        else {
	        	$createdOrder->orderItem()->createMany($orderItems);
	        }
		}			
		return true;
	}
}