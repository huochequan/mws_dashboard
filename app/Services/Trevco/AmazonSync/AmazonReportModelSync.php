<?php
namespace App\Services\Trevco\AmazonSync;

use App\Repositories\OrderRepository;
use App\Services\Trevco\AmazonReportTransformer;
use Exception;
use Illuminate\Support\Facades\Storage;
use Prewk\XmlStringStreamer;
use Prewk\XmlStringStreamer\Parser;
use Prewk\XmlStringStreamer\Stream;
use ReflectionClass;

class AmazonReportModelSync
{
	protected $reportTransformer;
	protected $seller;
	function __construct(AmazonReportTransformer $reportTransformer, $seller)
	{
		$this->reportTransformer = $reportTransformer;
		$this->seller = $seller;
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

	public function saveModelsFromFile($modelName, $reportDataFile)
	{
		// Specify the sellerID of the order.
		$model = \App::make($modelName);
		$dataType = (new ReflectionClass($model))->getShortName();
		$stream = new Stream\File($reportDataFile, 1024);
		$parser = new Parser\StringWalker(['uniqueNode' => $dataType]);
		$streamer =  XmlStringStreamer::createUniqueNodeParser($reportDataFile, array("uniqueNode" => $dataType));
		while ($orderNode = $streamer->getNode()) {
		    $order = camel_keys(json_decode(json_encode(simplexml_load_string($orderNode)), true));
		    $order = array_add($order, 'sellerID', $this->getSellerID($this->seller));
	        $orderItems = array_get($order, 'orderItem');
	        dump($order['amazonOrderID']);
	        if ($order['orderStatus'] != "Cancelled") {
		        $createdOrder = \App::make(OrderRepository::class)->updateOrCreate(array_only($order, ['amazonOrderID', 'merchantOrderID']),array_except($order, ['orderItem']));
	        	$createdOrder->orderItem()->delete();
		        if (empty($orderItems[0])) {
		        	$createdOrder->orderItem()->create($orderItems);
		        }
		        else {
		        	$createdOrder->orderItem()->createMany($orderItems);
		        }
	        }
		}
        unlink($reportDataFile);		
		return true;
	}

	private function getSellerID($seller)
	{
		$sellers = [
			[
				'id' => 1,
				'seller' => 'popfunk'
			],
			[
				'id' => 2,
				'seller' => 'trevco'
			]
		];
		if (!$sellers) {
			return null;
		}
		return array_first($sellers, function ($value) use ($seller)
		{
			return $value['seller'] == $seller;
		})['id'];
	}
}