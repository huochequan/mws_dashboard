<?php

use Symfony\Component\Process\Process;

if (!function_exists('camel_keys')) {
    /**
     * Convert array keys to camel case recursively.
     *
     * @param  array $array
     * @return string
     */
    function camel_keys($array)
    {
        $result = [];
        foreach ($array as $key => $value) {
            if (is_array($value)) {
                $value = camel_keys($value);
            }
            $result[camel_case($key)] = $value;
        }
        return $result;
    }
}

if (!function_exists('date_range')) {
    /**
     * Convert array keys to camel case recursively.
     *
     * @param  array $array
     * @return string
     */
    function date_range(\Carbon\Carbon $from, \Carbon\Carbon $to, $inclusive = true)
    {
        if ($from->gt($to)) {
            return null;
        }

        // Clone the date objects to avoid issues, then reset their time
        $from = $from->copy()->startOfDay();
        $to = $to->copy()->startOfDay();

        // Include the end date in the range
        if ($inclusive) {
            $to->addDay();
        }

        $step = Carbon\CarbonInterval::day();
        $period = new DatePeriod($from, $step, $to);

        // Convert the DatePeriod into a plain array of Carbon objects
        $range = [];

        foreach ($period as $day) {
            $range[] = new Carbon\Carbon($day);
        }

        return ! empty($range) ? $range : null;
    }
}

if (!function_exists('is_service_running')) {
    /**
     * Convert array keys to camel case recursively.
     *
     * @param  array $array
     * @return string
     */
    function is_service_running($service)
    {
        $process = new Process(trim("/bin/ps -e -o command | grep {$service}"));
        $process->run();
        $output = array_where(explode(PHP_EOL, $process->getOutput()),function ($processName, $key) use ($service)
        {
            return !str_contains($processName, "/dev/null") && str_contains($processName, "artisan {$service}");
        });
        //\Log::info($output);
        return count($output) > 1;       
    }
}

if (! function_exists('str_before')) {
    /**
     * Get the portion of a string before a given value.
     *
     * @param  string  $subject
     * @param  string  $search
     * @return string
     */
    function str_before($subject, $search)
    {
        return $search === '' ? $subject : explode($search, $subject)[0];
    }
}



if (! function_exists('get_walmart_auth_signature')) {
    /**
     * Get the portion of a string before a given value.
     *
     * @param  string  $subject
     * @param  string  $search
     * @return string
     */
    function get_walmart_auth_signature($URL, $RequestMethod, $Timestamp)
    {
      $WalmartPrivateKey = env('PRIVATE_KEY');//Your Walmart Private Key;
      $WalmartConsumerID = env('CONSUMER_ID');//Your Walmart Comsumer Id;
      // CONSTRUCT THE AUTH DATA WE WANT TO SIGN
      $AuthData = $WalmartConsumerID."\n";
      $AuthData .= $URL."\n";
      $AuthData .= $RequestMethod."\n";
      $AuthData .= $Timestamp."\n";
      // GET AN OPENSSL USABLE PRIVATE KEY FROM THE WARMART SUPPLIED SECRET
      $Pem = _ConvertPkcs8ToPem(base64_decode($WalmartPrivateKey));
      $PrivateKey = openssl_pkey_get_private($Pem);
      // SIGN THE DATA. USE sha256 HASH
      $Hash = defined("OPENSSL_ALGO_SHA256") ? OPENSSL_ALGO_SHA256 : "sha256";
      if (openssl_sign($AuthData, $Signature, $PrivateKey, $Hash))
      { // IF ERROR RETURN NULL return null; }
        //ENCODE THE SIGNATURE AND RETURN
        return base64_encode($Signature);
      }
    }
}

if (! function_exists('_ConvertPkcs8ToPem')) {
    /**
     * Get the portion of a string before a given value.
     *
     * @param  string  $subject
     * @param  string  $search
     * @return string
     */

      function _ConvertPkcs8ToPem($der)
      {
        static $BEGIN_MARKER = "-----BEGIN PRIVATE KEY-----";
        static $END_MARKER = "-----END PRIVATE KEY-----";
        $key = base64_encode($der);
        $pem = $BEGIN_MARKER . "\n";
        $pem .= chunk_split($key, 64, "\n");
        $pem .= $END_MARKER . "\n";
        return $pem;
      }
}
