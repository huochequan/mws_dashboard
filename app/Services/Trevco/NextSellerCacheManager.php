<?php

namespace App\Services\Trevco;

use Illuminate\Support\Facades\Cache;
/**
* Next seller cache management
*/
class NextSellerCacheManager
{
	protected $queueKey;

	public function __construct($queueKey)
	{
		$this->queueKey = $queueKey;
	}
    public function getNextSellerConfig($queueKey=null)
    {
    	$queueKey = $queueKey ? $queueKey : $this->queueKey;
        $nextSeller = null;
        if (Cache::has($queueKey)) {
            $sellers = Cache::get($queueKey);
            Cache::forget($queueKey);
        }else{
            $sellers = $this->initSellerQueueFromDatabase($queueKey);
        }
        Cache::rememberForever($queueKey, function () use ($queueKey, &$nextSeller, &$sellers)
        {
            $nextSeller = array_shift($sellers);
            array_push($sellers, $nextSeller);
            return $sellers;
        });

        return $nextSeller . '.php';
    }

    public function getNextSeller($queueKey=null)
    {
    	$queueKey = $queueKey ? $queueKey : $this->queueKey;
        $nextSeller = null;
        if (Cache::has($queueKey)) {
            $sellers = Cache::get($queueKey);
            Cache::forget($queueKey);
        }else{
            $sellers = $this->initSellerQueueFromDatabase($queueKey);
        }
        Cache::rememberForever($queueKey, function () use ($queueKey, &$nextSeller, &$sellers)
        {
            $nextSeller = array_shift($sellers);
            array_push($sellers, $nextSeller);
            return $sellers;
        });

        return $nextSeller;
    }

    private function initSellerQueueFromDatabase($queueKey=null)
    {
        return ['popfunk', 'trevco', 'walmart'];
    }
}