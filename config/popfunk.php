<?php
/**
 * Copyright 2013 CPI Group, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 *
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


$store['default']['merchantId'] = 'ASGX3PV2T7E3Q';//Merchant ID for this store
$store['default']['marketplaceId'] = 'ATVPDKIKX0DER'; //Marketplace ID for this store
$store['default']['keyId'] = 'AKIAJXXUOTERRZKBB7ZQ'; //Access Key ID
$store['default']['secretKey'] = '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'; //Secret Access Key for this store
$store['default']['serviceUrl'] = ''; //optional override for Service URL
//$store['default']['MWSAuthToken'] = 'amzn.mws.1caa2beb-a35e-1dde-0287-59a57106365f'; //token needed for web apps and third-party developers
$store['default']['shipToCountryCode'] = 'us'; //token needed for web apps and third-party developers

//Service URL Base
//Current setting is United States
$AMAZON_SERVICE_URL = 'https://mws.amazonservices.com/';

//Location of log file to use
$logpath = storage_path('logs/laravel.log');

//Name of custom log function to use
$logfunction = '';

//Turn off normal logging
$muteLog = false;

?>
