<?php

/**
 * @param $pos: string(POINT([numeric] [numeric]))
 * @return ["long" => [numeric], "lat" => [numeric]]
 */
function loc2pos($pos){
    $pattern = "/-?[0-9]+(\.[0-9]+)?/";
    $match = NULL;
    $result = preg_match_all($pattern, $pos, $match);
    return [
        "long" => $match[0][0],
        "lat" => $match[0][1]
    ];
}