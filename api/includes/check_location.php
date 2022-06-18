<?php

function check_loc($long, $lat) {
    if (!is_numeric($long) || !is_numeric($lat)){
        return false;
    }
    else if ($long > 180 || $long < -180 || $lat > 90 || $lat < -90) {
        return false;
    } 
    else {
        return true;
    }
}