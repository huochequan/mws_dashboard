<?php
namespace App\Services\Trevco\AmazonSync;

// use Symfony\Bridge\Twig\TwigEngine;

class AmazonFbaService extends AmazonService
{
    // const REPORT_TYPE = '_GET_FBA_MYI_UNSUPPRESSED_INVENTORY_DATA_'; // _GET_AFN_INVENTORY_DATA_
    const REPORT_TYPE = '_GET_XML_ALL_ORDERS_DATA_BY_LAST_UPDATE_'; // _GET_AFN_INVENTORY_DATA_

    private $blackList = [
        'DCO610BSTK-AT*',
        'DCO611STK-AT*',
        'DCO617BSTK-AT*',
        'CBS261HTSTK-AT*',
        'CBS262HTSTK-AT*',
        'CBS263HTSTK-AT*',
        'BM2182STK-AT*',
	'CBS1898-STK-4x18',
	'PERRY116STK-AT*',
	'PERRY179STK-AT*',
	'DCO617STK-AT*',
	'BM2182STK-AFTH*',
	'BAND101STK-JS*',               
	'BAND112BSTK-AT*',
	'BAND101STK-AT*', 
	'BAND103STK-AT*',  
	'BAND112CSTK-YT*',
	'BAND113STK-AT*',
	'BAND115STK-AT*',
	'BAND116STK-AT*'
    ];

    public function __construct()
    {
        parent::__construct(self::REPORT_TYPE);
    }

    /**
     * @return string
     */
    public function getInventoryFilename()
    {
        return 'fba-'.date('YmdHis').'.xml';
    }

    /**
     * @param string $report
     * @return array
     */
    public function getProductsFromReport($report)
    {
        $products = [];
        $productsData = preg_split("/[\n]/", $report);

        foreach ($productsData as $productData) {
            $bareProduct = preg_split("/[\t]/", $productData);
            $product = [
                'seller-sku' => trim($bareProduct[0]),
                'fnsku' => trim($bareProduct[1]),
                'asin' => trim($bareProduct[2]),
                'product-name' => trim($bareProduct[3]),
                'afn-listing-exists' => trim($bareProduct[8]),
                'afn-fulfillable-quantity' => intval($bareProduct[10]),
                'afn-reserved-quantity' => intval($bareProduct[12]),
            ];

            if (!$this->inBlackList($product['seller-sku'])) {
                array_push($products, $product);
            }
        }

        array_shift($products);

        $soldProducts = $this->getSoldProducts($products);
        return $soldProducts;
    }


    /**
     * @param array $products
     * @return array
     */
    public function getSoldProducts($products)
    {
        $soldProducts = [];
        foreach ($products as $product) {
            if ($product['afn-fulfillable-quantity'] == 0 and $product['afn-listing-exists'] == 'Yes') {
                array_push($soldProducts, $product);
            }
        }
        return $soldProducts;
    }


    /**
     * @param array $inventory
     * @return string
     */
    public function buildInventoryList($inventory)
    {
        dump($inventory); die();
        return 0;
        // return $this->twig->render(
        //     'AppBundle::fba-inventory.xml.twig', ['inventory' => $inventory]
        // );
    }


    /**
     * @param $name
     * @return bool
     */
    private function inBlackList($name)
    {
        $inBlackList = false;

        foreach ($this->blackList as $blackListItem) {
            if ((bool)fnmatch($blackListItem, $name)) {
                $inBlackList = true;
                break;
            }
        }

        return $inBlackList;
    }
}
