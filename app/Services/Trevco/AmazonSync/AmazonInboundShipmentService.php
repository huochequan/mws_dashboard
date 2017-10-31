<?php
namespace AppBundle\Service;

use Symfony\Bridge\Twig\TwigEngine;
use AppBundle\Library\CustomAmazonPrepInfo;
use \AmazonShipmentPlanner;
use \AmazonShipment;

class AmazonInboundShipmentService extends AmazonService
{
    /**
     * @var string
     */
    var $configFile = '';

    public function __construct()
    {
        $this->configFile = __DIR__ . '/../../../app/config/amazon-config.php';
    }

    /**
     * @return array
     */
    private function getTestPostData()
    {
        return [
            "key" => "trevcoDEV!!",
            "name" => "Transfer Order: 123",
            "fromAddress" => [
                "name" => "Trevco",
                "addressLine1" => "1900 Stephenson Hwy",
                "city" => "Troy",
                "state" => "MI",
                "zip" => "48083",
                "country" => "US"
            ],
            "items" => [
                [
                    "sku" => "BM1500-AT-1",
                    "quantity" => 5
                ],
                [
                    "sku" => "BM1500-AT-2",
                    "quantity" => 5
                ]
            ]
        ];
    }


    /**
     * @param array $postData
     * @return string
     */
    public function execute($postData = [])
    {
        if (!count($postData)) {
            $postData = $this->getTestPostData();
        }

        if ($this->requestPrepInfo($postData) !== false) {

            $amazonShipmentPlanner = $this->getAmazonShipmentPlanner($postData);
            $plannerResponse = $amazonShipmentPlanner->getRawResponses();
            $shipmentPlans = $amazonShipmentPlanner->getPlan();

            $totalShipments = count($shipmentPlans);
            foreach ($shipmentPlans as $i => $shipmentPlan) {
                $this->createShipment($postData, $shipmentPlan, $totalShipments, $i);
            }

            return $plannerResponse[0]['body'];
        }
    }

    /**
     * @param $postData
     * @return bool
     */
    private function requestPrepInfo($postData)
    {
        $amazonPrepInfo = new CustomAmazonPrepInfo('default', false, null, $this->configFile);
        $amazonPrepInfo->setShippingCode($postData['fromAddress']['country']);

        $skuList = [];
        foreach ($postData['items'] as $item) {
            $skuList[] = $item['sku'];
        }
        $amazonPrepInfo->setSkus($skuList);

        return $amazonPrepInfo->fetchPrepInstructions();
    }


    /**
     * @param $postData
     * @return AmazonShipmentPlanner
     */
    private function getAmazonShipmentPlanner($postData)
    {
        $amazonShipmentPlanner = new AmazonShipmentPlanner('default', false, null, $this->configFile);
        $amazonShipmentPlanner->setAddress($this->getAddressFromPostData($postData));
        $amazonShipmentPlanner->setItems($this->getItemsFromPostData($postData));
        $amazonShipmentPlanner->fetchPlan();

        return $amazonShipmentPlanner;
    }


    /**
     * @param array $postData
     * @return array
     */
    public function getAddressFromPostData($postData)
    {
        $address = array();
        $address['Name'] = $postData['fromAddress']['name'];
        $address['AddressLine1'] = $postData['fromAddress']['addressLine1'];
        $address['City'] = $postData['fromAddress']['city'];
        $address['StateOrProvinceCode'] = $postData['fromAddress']['state'];
        $address['CountryCode'] = $postData['fromAddress']['country'];
        $address['PostalCode'] = $postData['fromAddress']['zip'];

        return $address;
    }


    /**
     * @param array $postData
     * @return array
     */
    public function getItemsFromPostData($postData)
    {
        $items = array();
        foreach ($postData['items'] as $item) {
            $items[] = [
                'SellerSKU' => $item['sku'],
                'Quantity' => $item['quantity']
            ];
        }

        return $items;
    }


    /**
     * @param array $postData
     * @param array $shipmentPlan
     * @param int $totalShipments
     * @param int $currentShipment
     * @return array|bool
     */
    private function createShipment($postData, $shipmentPlan, $totalShipments, $currentShipment)
    {
        $amazonShipment = new AmazonShipment('default', false, null, $this->configFile);
        $amazonShipment->usePlan($shipmentPlan);

        if ($totalShipments > 1) {
            $name = $postData['name'] . ' (' . ($currentShipment +1) . ' of ' . $totalShipments . ')';
        } else {
            $name = $postData['name'];
        }

        $amazonShipment->setShipmentName($name);
        $amazonShipment->setStatus('WORKING');
        $amazonShipment->setLabelPrepPreference('SELLER_LABEL');
        $amazonShipment->setAddress($this->getAddressFromPostData($postData));
        $amazonShipment->createShipment();

        return $amazonShipment->getLastResponse();
    }
}