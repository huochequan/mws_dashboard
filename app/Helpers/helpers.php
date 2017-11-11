<?php
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
