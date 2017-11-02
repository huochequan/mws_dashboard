<?php

namespace Tests\Feature;

use App\Services\Trevco\AmazonReportTransformer;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class AmazonReportTransformerTest extends TestCase
{
    /**
     * A basic test example.
     *
     * @return void
     */
    public function testExtractsArrayFromReceivedData()
    {
    	$xmlData = '<?xml version="1.0" encoding="ISO-8859-1"?>
    	<AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
    		<Header>
    			<DocumentVersion>1.00</DocumentVersion>
    		</Header>
    		<MessageType>AllOrdersReport</MessageType>
    		<Message>
    			<Order>
    				<AmazonOrderID>111-5574600-0153060</AmazonOrderID>
    				<MerchantOrderID>111-5574600-0153060</MerchantOrderID>
    				<PurchaseDate>2017-10-30T20:06:06+00:00</PurchaseDate>
    				<LastUpdatedDate>2017-10-30T20:06:11+00:00</LastUpdatedDate>
    				<OrderStatus>Pending</OrderStatus>
    				<SalesChannel>Amazon.com</SalesChannel>
    				<FulfillmentData>
    					<FulfillmentChannel>Amazon</FulfillmentChannel>
    					<ShipServiceLevel>SecondDay</ShipServiceLevel>
    					<Address>
    						<City>MIAMI</City>
    						<State>FL</State>
    						<PostalCode>33195-2855</PostalCode>
    						<Country>US</Country>
    					</Address>
    				</FulfillmentData>
    				<IsBusinessOrder>false</IsBusinessOrder>
    				<OrderItem>
    					<ASIN>B074G4GB3P</ASIN>
    					<SKU>JLM106STK-AT-2</SKU>
    					<ItemStatus>Unshipped</ItemStatus>
    					<ProductName>Justice League Movie DC Comics Emblems T Shirt &amp; Exclusive Stickers (Medium)</ProductName>
    					<Quantity>1</Quantity>
    					<ItemPrice>
    						<Component>
    							<Type>Principal</Type>
    							<Amount currency="USD">15.95</Amount>
    						</Component>
    					</ItemPrice>
    				</OrderItem>
    				<OrderItem>
    					<ASIN>B0753YQTZR</ASIN>
    					<SKU>JLM157STK-AT-1</SKU>
    					<ItemStatus>Unshipped</ItemStatus>
    					<ProductName>Justice League Movie Batman DC Comics Logo T Shirt &amp; Exclusive Stickers (Small)</ProductName>
    					<Quantity>1</Quantity>
    					<ItemPrice>
    						<Component>
    							<Type>Principal</Type>
    							<Amount currency="USD">24.99</Amount>
    						</Component>
    					</ItemPrice>
    				</OrderItem>
    			</Order>
    		</Message>
    	</AmazonEnvelope>
    	';
    	$amazonReportTransformer = new AmazonReportTransformer();

    	$expectedOrdersArray = [
    	[
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
    	'isBusinessOrder' => 'false',
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
    	]
    	];
    	$actualOrdersArray = $amazonReportTransformer->getArrayFromPayload('order', $xmlData);
    	$this->assertEquals($expectedOrdersArray, $actualOrdersArray);

    	$multiOrderXmlData = '<?xml version="1.0" encoding="ISO-8859-1"?>
    	<AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
    		<Header>
    			<DocumentVersion>1.00</DocumentVersion>
    		</Header>
    		<MessageType>AllOrdersReport</MessageType>
    		<Message>
    			<Order>
    				<AmazonOrderID>111-5574600-0153060</AmazonOrderID>
    				<MerchantOrderID>111-5574600-0153060</MerchantOrderID>
    				<PurchaseDate>2017-10-30T20:06:06+00:00</PurchaseDate>
    				<LastUpdatedDate>2017-10-30T20:06:11+00:00</LastUpdatedDate>
    				<OrderStatus>Pending</OrderStatus>
    				<SalesChannel>Amazon.com</SalesChannel>
    				<FulfillmentData>
    					<FulfillmentChannel>Amazon</FulfillmentChannel>
    					<ShipServiceLevel>SecondDay</ShipServiceLevel>
    					<Address>
    						<City>MIAMI</City>
    						<State>FL</State>
    						<PostalCode>33195-2855</PostalCode>
    						<Country>US</Country>
    					</Address>
    				</FulfillmentData>
    				<IsBusinessOrder>false</IsBusinessOrder>
    				<OrderItem>
    					<ASIN>B074G4GB3P</ASIN>
    					<SKU>JLM106STK-AT-2</SKU>
    					<ItemStatus>Unshipped</ItemStatus>
    					<ProductName>Justice League Movie DC Comics Emblems T Shirt &amp; Exclusive Stickers (Medium)</ProductName>
    					<Quantity>1</Quantity>
    					<ItemPrice>
    						<Component>
    							<Type>Principal</Type>
    							<Amount currency="USD">15.95</Amount>
    						</Component>
    					</ItemPrice>
    				</OrderItem>
    				<OrderItem>
    					<ASIN>B0753YQTZR</ASIN>
    					<SKU>JLM157STK-AT-1</SKU>
    					<ItemStatus>Unshipped</ItemStatus>
    					<ProductName>Justice League Movie Batman DC Comics Logo T Shirt &amp; Exclusive Stickers (Small)</ProductName>
    					<Quantity>1</Quantity>
    					<ItemPrice>
    						<Component>
    							<Type>Principal</Type>
    							<Amount currency="USD">24.99</Amount>
    						</Component>
    					</ItemPrice>
    				</OrderItem>
    			</Order>
    		</Message>
    		<Message>
    			<Order>
    				<AmazonOrderID>111-5574600-0153060</AmazonOrderID>
    				<MerchantOrderID>111-5574600-0153060</MerchantOrderID>
    				<PurchaseDate>2017-10-30T20:06:06+00:00</PurchaseDate>
    				<LastUpdatedDate>2017-10-30T20:06:11+00:00</LastUpdatedDate>
    				<OrderStatus>Pending</OrderStatus>
    				<SalesChannel>Amazon.com</SalesChannel>
    				<FulfillmentData>
    					<FulfillmentChannel>Amazon</FulfillmentChannel>
    					<ShipServiceLevel>SecondDay</ShipServiceLevel>
    					<Address>
    						<City>MIAMI</City>
    						<State>FL</State>
    						<PostalCode>33195-2855</PostalCode>
    						<Country>US</Country>
    					</Address>
    				</FulfillmentData>
    				<IsBusinessOrder>false</IsBusinessOrder>
    				<OrderItem>
    					<ASIN>B074G4GB3P</ASIN>
    					<SKU>JLM106STK-AT-2</SKU>
    					<ItemStatus>Unshipped</ItemStatus>
    					<ProductName>Justice League Movie DC Comics Emblems T Shirt &amp; Exclusive Stickers (Medium)</ProductName>
    					<Quantity>1</Quantity>
    					<ItemPrice>
    						<Component>
    							<Type>Principal</Type>
    							<Amount currency="USD">15.95</Amount>
    						</Component>
    					</ItemPrice>
    				</OrderItem>
    				<OrderItem>
    					<ASIN>B0753YQTZR</ASIN>
    					<SKU>JLM157STK-AT-1</SKU>
    					<ItemStatus>Unshipped</ItemStatus>
    					<ProductName>Justice League Movie Batman DC Comics Logo T Shirt &amp; Exclusive Stickers (Small)</ProductName>
    					<Quantity>1</Quantity>
    					<ItemPrice>
    						<Component>
    							<Type>Principal</Type>
    							<Amount currency="USD">24.99</Amount>
    						</Component>
    					</ItemPrice>
    				</OrderItem>
    			</Order>
    		</Message>
    	</AmazonEnvelope>
    	';

    	$expectedMultiOrdersArray = 
    	[
	    	[
		    	'amazonOrderID' => '111-5574600-0153060',
		    	'merchantOrderID' => '111-5574600-0153060',
		    	'purchaseDate' => '2017-10-30T20:06:06+00:00',
		    	'lastUpdatedDate' => '2017-10-30T20:06:11+00:00',
		    	'orderStatus' => 'Pending',
		    	'salesChannel' => 'Amazon.com',
		    	'fulfillmentData' => 
			    	[
				    	'fulfillmentChannel' => 'Amazon',
				    	'shipServiceLevel' => 'SecondDay',
				    	'address' => 
					    	[
					    	'city' =>'MIAMI',
					    	'state' =>'FL',
					    	'postalCode' =>'33195-2855',
					    	'country' =>'US',
					    	],      
			    	],
		    	'isBusinessOrder' => 'false',
		    	'orderItem' => 
			    	[
				    	0 => [
					    	'aSIN' => 'B074G4GB3P',
					    	'sKU' => 'JLM106STK-AT-2',
					    	'itemStatus' => 'Unshipped',
					    	'productName' => 'Justice League Movie DC Comics Emblems T Shirt & Exclusive Stickers (Medium)',
					    	'quantity' => '1',
					    	'itemPrice' => 
						    	[
						    	'component' => 
							    	[
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
				    	'itemPrice' => 
					    	[
					    	'component' => 
						    	[
						    	'type' => 'Principal',
						    	'amount' => 24.99,
						    	]
					    	]
				    	]
			    	]   
		    ],
	    	[
		    	'amazonOrderID' => '111-5574600-0153060',
		    	'merchantOrderID' => '111-5574600-0153060',
		    	'purchaseDate' => '2017-10-30T20:06:06+00:00',
		    	'lastUpdatedDate' => '2017-10-30T20:06:11+00:00',
		    	'orderStatus' => 'Pending',
		    	'salesChannel' => 'Amazon.com',
		    	'fulfillmentData' => 
			    	[
				    	'fulfillmentChannel' => 'Amazon',
				    	'shipServiceLevel' => 'SecondDay',
				    	'address' => 
					    	[
					    	'city' =>'MIAMI',
					    	'state' =>'FL',
					    	'postalCode' =>'33195-2855',
					    	'country' =>'US',
					    	],      
			    	],
		    	'isBusinessOrder' => 'false',
		    	'orderItem' => 
			    	[
				    	0 => [
					    	'aSIN' => 'B074G4GB3P',
					    	'sKU' => 'JLM106STK-AT-2',
					    	'itemStatus' => 'Unshipped',
					    	'productName' => 'Justice League Movie DC Comics Emblems T Shirt & Exclusive Stickers (Medium)',
					    	'quantity' => '1',
					    	'itemPrice' => 
						    	[
						    	'component' => 
							    	[
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
				    	'itemPrice' => 
					    	[
					    	'component' => 
						    	[
						    	'type' => 'Principal',
						    	'amount' => 24.99,
						    	]
					    	]
				    	]
			    	]   
		    ]		    
    	];

    	$actualMultiOrdersArray = $amazonReportTransformer->getArrayFromPayload('order', $multiOrderXmlData);
    	$this->assertEquals($expectedMultiOrdersArray, $actualMultiOrdersArray);

    }
}
