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