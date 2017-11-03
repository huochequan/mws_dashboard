<?php

namespace Tests\Feature;

use App\Order;
use App\Services\Trevco\AmazonReportTransformer;
use App\Services\Trevco\AmazonSync\AmazonReportModelSync;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Foundation\Testing\DatabaseTransactions;
use Illuminate\Foundation\Testing\WithoutMiddleware;
use Tests\TestCase;

class AmazonReportTransformerTest extends TestCase
{
    use WithoutMiddleware, DatabaseTransactions, DatabaseMigrations;

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

    public function testSavesOrdersFromValidSyncReport()
    {
        $this->reportModelSync =  new AmazonReportModelSync((new AmazonReportTransformer()));
        $this->reportModelSync->saveModels(Order::class,$this->mockReportData());
        $payloadArray = json_decode(json_encode(simplexml_load_string($this->mockReportData())), true);
        $noOfExpectedOrders = count(array_get($payloadArray, 'Message'));
        $noOfActualOrders = Order::all()->count();

        $this->assertEquals($noOfExpectedOrders, $noOfActualOrders);
    }

    private function mockReportData()
    {
        return '<?xml version="1.0" encoding="ISO-8859-1"?>
<AmazonEnvelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="amzn-envelope.xsd">
<Header>
 <DocumentVersion>1.00</DocumentVersion>
 </Header>
<MessageType>AllOrdersReport</MessageType>
<Message>
   <Order>
      <AmazonOrderID>111-2500433-0247433</AmazonOrderID>
      <MerchantOrderID>111-2500433-0247433</MerchantOrderID>
      <PurchaseDate>2017-10-30T00:32:50+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:13:10+00:00</LastUpdatedDate>
      <OrderStatus>Shipped</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Amazon</FulfillmentChannel>
         <ShipServiceLevel>SecondDay</ShipServiceLevel>
         <Address>
            <City>LEWISBURG</City>
            <State>WV</State>
            <PostalCode>24901-1196</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B015HMONDA</ASIN>
        <SKU>CBGB102-HA-5</SKU>
        <ItemStatus>Shipped</ItemStatus>
        <ProductName>CBGB Tattered Logo Mens Heather Shirt</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">15.5</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
<Message>
   <Order>
      <AmazonOrderID>114-5309652-6657051</AmazonOrderID>
      <MerchantOrderID>114-5309652-6657051</MerchantOrderID>
      <PurchaseDate>2017-10-30T20:12:09+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:12:11+00:00</LastUpdatedDate>
      <OrderStatus>Pending</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Amazon</FulfillmentChannel>
         <ShipServiceLevel>SecondDay</ShipServiceLevel>
         <Address>
            <City>SEVERN</City>
            <State>MD</State>
            <PostalCode>21144-2755</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B01LDCS2BW</ASIN>
        <SKU>BAND124STK-AT-3</SKU>
        <ItemStatus>Unshipped</ItemStatus>
        <ProductName>Misfits Officially Licensed T-Shirt and Exclusive Stickers (Large)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">19.55</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
<Message>
   <Order>
      <AmazonOrderID>114-0887481-3910638</AmazonOrderID>
      <MerchantOrderID>114-0887481-3910638</MerchantOrderID>
      <PurchaseDate>2017-10-30T20:09:38+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:09:39+00:00</LastUpdatedDate>
      <OrderStatus>Pending</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Amazon</FulfillmentChannel>
         <ShipServiceLevel>SecondDay</ShipServiceLevel>
         <Address>
            <City>West Warwick</City>
            <State>RI</State>
            <PostalCode>02893-2334</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B01NBVF38C</ASIN>
        <SKU>DCO148STK-JS-5</SKU>
        <ItemStatus>Unshipped</ItemStatus>
        <ProductName>Superman Logo Distressed Juniors T Shirt &amp; Exclusive Stickers (XX-Large)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">17.95</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
<Message>
   <Order>
      <AmazonOrderID>111-1783057-3602618</AmazonOrderID>
      <MerchantOrderID>111-1783057-3602618</MerchantOrderID>
      <PurchaseDate>2017-10-30T02:53:33+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:09:34+00:00</LastUpdatedDate>
      <OrderStatus>Pending</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Amazon</FulfillmentChannel>
         <ShipServiceLevel>NextDay</ShipServiceLevel>
         <Address>
            <City>MIAMI BEACH</City>
            <State>FL</State>
            <PostalCode>33141-5780</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B01MSB8J6D</ASIN>
        <SKU>BLE114STK-AT-4</SKU>
        <ItemStatus>Unshipped</ItemStatus>
        <ProductName>Bruce Lee Enter the Dragon Kung Fu Movie T Shirt &amp; Exclusive Stickers (X-Large)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">17.55</Amount>
           </Component>
           <Component>
              <Type>Shipping</Type>
              <Amount currency="USD">3.99</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
<Message>
   <Order>
      <AmazonOrderID>114-2266286-3172244</AmazonOrderID>
      <PurchaseDate>2017-10-30T19:39:37+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:09:29+00:00</LastUpdatedDate>
      <OrderStatus>Pending</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Merchant</FulfillmentChannel>
         <ShipServiceLevel>Standard</ShipServiceLevel>
         <Address>
            <City>DRASCO</City>
            <State>AR</State>
            <PostalCode>72530-9204</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B07198F8X6</ASIN>
        <SKU>PERRY112STK-PSF-1</SKU>
        <ItemStatus>Unshipped</ItemStatus>
        <ProductName>Janis Joplin Psychedelic T Shirt &amp; Exclusive Stickers (Small)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">19.95</Amount>
           </Component>
           <Component>
              <Type>Shipping</Type>
              <Amount currency="USD">6.99</Amount>
           </Component>
           <Component>
               <Type>GiftWrap</Type>
               <Amount currency="USD">0.0</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
<Message>
   <Order>
      <AmazonOrderID>114-9762449-6792236</AmazonOrderID>
      <PurchaseDate>2017-10-30T20:03:53+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:09:00+00:00</LastUpdatedDate>
      <OrderStatus>Pending</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Merchant</FulfillmentChannel>
         <ShipServiceLevel>Standard</ShipServiceLevel>
         <Address>
            <City>DRASCO</City>
            <State>AR</State>
            <PostalCode>72530-9204</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B07198F8X6</ASIN>
        <SKU>PERRY112STK-PSF-1</SKU>
        <ItemStatus>Unshipped</ItemStatus>
        <ProductName>Janis Joplin Psychedelic T Shirt &amp; Exclusive Stickers (Small)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">19.95</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
<Message>
   <Order>
      <AmazonOrderID>113-2615246-7465861</AmazonOrderID>
      <MerchantOrderID>113-2615246-7465861</MerchantOrderID>
      <PurchaseDate>2017-10-29T20:31:46+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:08:50+00:00</LastUpdatedDate>
      <OrderStatus>Shipped</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Amazon</FulfillmentChannel>
         <ShipServiceLevel>NextDay</ShipServiceLevel>
         <Address>
            <City>MENDON</City>
            <State>NY</State>
            <PostalCode>14506-9773</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B01MDMAIQ7</ASIN>
        <SKU>BM288STK-AT-3</SKU>
        <ItemStatus>Shipped</ItemStatus>
        <ProductName>Batman Classic Logo T Shirt and Exclusive Stickers (Large)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">20.25</Amount>
           </Component>
           <Component>
              <Type>Shipping</Type>
              <Amount currency="USD">3.99</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
<Message>
   <Order>
      <AmazonOrderID>114-9344632-3221067</AmazonOrderID>
      <MerchantOrderID>114-9344632-3221067</MerchantOrderID>
      <PurchaseDate>2017-10-30T20:08:11+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:08:12+00:00</LastUpdatedDate>
      <OrderStatus>Pending</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Amazon</FulfillmentChannel>
         <ShipServiceLevel>SecondDay</ShipServiceLevel>
         <Address>
            <City>TUCSON</City>
            <State>AZ</State>
            <PostalCode>85719-2813</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B01N4X6OR1</ASIN>
        <SKU>ACDC106STK-AT-3</SKU>
        <ItemStatus>Unshipped</ItemStatus>
        <ProductName>ACDC For Those About To Rock Album T Shirt &amp; Exclusive Stickers (Large)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">17.45</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
<Message>
   <Order>
      <AmazonOrderID>113-9728865-6514655</AmazonOrderID>
      <PurchaseDate>2017-10-30T19:37:35+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:07:13+00:00</LastUpdatedDate>
      <OrderStatus>Pending</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Merchant</FulfillmentChannel>
         <ShipServiceLevel>Standard</ShipServiceLevel>
         <Address>
            <City>Pittsburgh</City>
            <State>Pennsylvania</State>
            <PostalCode>15203</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B071DZC7FX</ASIN>
        <SKU>NBC901STK-AT-6</SKU>
        <ItemStatus>Unshipped</ItemStatus>
        <ProductName>Parks and Recreation Mouse Rat T Shirt &amp; Exclusive Stickers (XXX-Large)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">20.95</Amount>
           </Component>
           <Component>
              <Type>Shipping</Type>
              <Amount currency="USD">6.99</Amount>
           </Component>
           <Component>
               <Type>GiftWrap</Type>
               <Amount currency="USD">0.0</Amount>
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
<Message>
   <Order>
      <AmazonOrderID>114-8203389-3882626</AmazonOrderID>
      <MerchantOrderID>114-8203389-3882626</MerchantOrderID>
      <PurchaseDate>2017-10-30T06:26:51+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:04:03+00:00</LastUpdatedDate>
      <OrderStatus>Shipped</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Amazon</FulfillmentChannel>
         <ShipServiceLevel>SecondDay</ShipServiceLevel>
         <Address>
            <City>Pasadena</City>
            <State>Ca</State>
            <PostalCode>91107</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B06Y5Z7NKG</ASIN>
        <SKU>PAR594STK-AT-4</SKU>
        <ItemStatus>Shipped</ItemStatus>
        <ProductName>The Godfather Movie Logo T Shirt &amp; Exclusive Stickers (X-Large)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">15.5</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
<Message>
   <Order>
      <AmazonOrderID>111-4961961-6690606</AmazonOrderID>
      <PurchaseDate>2017-10-30T19:30:50+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:01:06+00:00</LastUpdatedDate>
      <OrderStatus>Pending</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Merchant</FulfillmentChannel>
         <ShipServiceLevel>Standard</ShipServiceLevel>
         <Address>
            <City>Riverside</City>
            <State>CA</State>
            <PostalCode>92508</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B01N1WHY19</ASIN>
        <SKU>UNI340STK-AT-3</SKU>
        <ItemStatus>Unshipped</ItemStatus>
        <ProductName>Back to the Future T-Shirt and Exclusive Stickers (Large)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">15.95</Amount>
           </Component>
           <Component>
              <Type>Shipping</Type>
              <Amount currency="USD">6.99</Amount>
           </Component>
           <Component>
               <Type>GiftWrap</Type>
               <Amount currency="USD">0.0</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
<Message>
   <Order>
      <AmazonOrderID>114-8564766-4509001</AmazonOrderID>
      <MerchantOrderID>114-8564766-4509001</MerchantOrderID>
      <PurchaseDate>2017-10-30T20:00:42+00:00</PurchaseDate>
      <LastUpdatedDate>2017-10-30T20:00:57+00:00</LastUpdatedDate>
      <OrderStatus>Cancelled</OrderStatus>
      <SalesChannel>Amazon.com</SalesChannel>
      <FulfillmentData>
         <FulfillmentChannel>Amazon</FulfillmentChannel>
         <ShipServiceLevel>Standard</ShipServiceLevel>
         <Address>
            <City>TIFTON</City>
            <State>GA</State>
            <PostalCode>31794-2423</PostalCode>
            <Country>US</Country>
         </Address>
     </FulfillmentData>
     <IsBusinessOrder>false</IsBusinessOrder>
     <OrderItem>
        <ASIN>B06Y5DBCG8</ASIN>
        <SKU>UNI682STK-AT-2</SKU>
        <ItemStatus>Unshipped</ItemStatus>
        <ProductName>Scarface The World Is Yours T Shirt &amp; Exclusive Stickers (Medium)</ProductName>
        <Quantity>1</Quantity>
        <ItemPrice>
           <Component>
              <Type>Principal</Type>
              <Amount currency="USD">15.5</Amount>
           </Component>
        </ItemPrice>
     </OrderItem>
  </Order>
</Message>
</AmazonEnvelope>
';
    }
}
