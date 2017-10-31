<?php
namespace AppBundle\Service;

use Symfony\Bridge\Twig\TwigEngine;

class AmazonStrandedService extends AmazonService
{
    const REPORT_TYPE = '_GET_STRANDED_INVENTORY_LOADER_DATA_';

    public function __construct(TwigEngine $twig)
    {
        parent::__construct(self::REPORT_TYPE, $twig);
    }


    /**
     * @return string
     */
    public function getInventoryFilename()
    {
        return 'stranded-'.date('YmdHis').'.xml';
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
            ];
            array_push($products, $product);
        }

        array_shift($products);
        return $products;
    }


    /**
     * @param array $inventory
     * @return string
     */
    public function buildInventoryList($inventory)
    {
        return $this->twig->render(
            'AppBundle::stranded-inventory.xml.twig', ['inventory' => $inventory]
        );
    }
}