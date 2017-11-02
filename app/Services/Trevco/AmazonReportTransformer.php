<?php
namespace App\Services\Trevco;
/**
* Amazon Report transformer service
*/
class AmazonReportTransformer
{	
	public function getArrayFromPayload($dataType, $xmlPayload)
	{
		$payloadArray = json_decode(json_encode(simplexml_load_string($xmlPayload)), true);
		$reportMessages = array_get($payloadArray, 'Message');
		$reportMessages = (count($reportMessages) > 1) ? $reportMessages : [$reportMessages];
		$orders = array_pluck($reportMessages, ucwords($dataType));
		return camel_keys($orders);
	}
}