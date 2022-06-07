<?php

const MAX_INT = 2147483647;

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

$reqdata = json_req_body();
$f = $reqdata->filter;

$searchbystore = "SELECT * FROM store WHERE 
             (SQRT(POWER(longtitude-?,2) + POWER(latitude-?,2)) <= ? OR NOT ?) AND
             (class LIKE CONCAT('%',?,'%') OR NOT ?) AND
             (sid IN (SELECT store from food WHERE price <= ?) OR NOT ?) AND
             (sid IN (SELECT store from food WHERE price >= ?) OR NOT ?) AND
             (name LIKE CONCAT('%',?,'%') OR NOT ?);";

$searchbyfood = "SELECT * FROM store WHERE 
                (SQRT(POWER(longtitude-?,2) + POWER(latitude-?,2)) <= ? OR NOT ?) AND
                (class LIKE CONCAT('%',?,'%') OR NOT ?) AND
                (sid IN (SELECT store from food WHERE price <= ?) OR NOT ?) AND
                (sid IN (SELECT store from food WHERE price >= ?) OR NOT ?) AND
                (sid IN (SELECT store from food WHERE name LIKE CONCAT('%',?,'%')) OR NOT ?);";

$sbs_stmt = $conn->prepare($searchbystore);
$sbf_stmt = $conn->prepare($searchbyfood);

$f_default = [
    "long" => 0,
    "lat" => 0,
    "dist" => MAX_INT,
    "class" => "empty",
    "pricelow" => 0,
    "pricehigh" => MAX_INT
];

$con_ac = [ //activated conditions
    "dist" => $f->activated && $f->distance,
    "class" => $f->activated && $f->class,
    "pricelow" => $f->activated && $f->pricelow,
    "pricehigh" => $f->activated && $f->pricehigh,
    "search" => !($reqdata->search == "")
];

$param = [
    "long" => $f->position->longtitude?$f->position->longtitude:$f_default["long"],
    "lat" => $f->position->latitude?$f->position->latitude:$f_default["lat"],
    "dist" => $con_ac["dist"]?$f->distance:$f_default["dist"],
    "class" => $con_ac["class"]?$f->class:$f_default["class"],
    "pricelow" => $con_ac["pricelow"]?$f->pricelow:$f_default["pricelow"],
    "pricehigh" => $con_ac["pricehigh"]?$f->pricehigh:$f_default["pricehigh"],
    "search" => $con_ac["search"]?$reqdata->search:"",
];

$sbs_stmt->bind_param("dddisiiiiisi",
                    $param["long"], $param["lat"], $param["dist"], $con_ac["dist"],
                    $param["class"], $con_ac["class"],
                    $param["pricehigh"], $con_ac["pricehigh"],
                    $param["pricelow"], $con_ac["pricelow"],
                    $param["search"], $con_ac["search"]
);

$sbf_stmt->bind_param("dddisiiiiisi",
                    $param["long"], $param["lat"], $param["dist"], $con_ac["dist"],
                    $param["class"], $con_ac["class"],
                    $param["pricehigh"], $con_ac["pricehigh"],
                    $param["pricelow"], $con_ac["pricelow"],
                    $param["search"], $con_ac["search"]
);

$sbs_res = array(); 
if ($sbs_stmt->execute()){
    $result = $sbs_stmt->get_result();
    $sbs_res = [];
    while($row = mysqli_fetch_array($result)){
        $sbs_res[] = $row;
    }
} else {
    $sbs_res = array(
        'status' => 1,
        'error' => $sbs_stmt->error
    ); 
}

$sbf_res = array(); 
if ($sbf_stmt->execute()){
    $result = $sbf_stmt->get_result();
    $sbf_res = [];
    while($row = mysqli_fetch_array($result)){
        $sbf_res[] = $row;
    }
} else {
    $sbf_res = array(
        'status' => 1,
        'error' => $sbf_stmt->error
    ); 
}

json_res([
    "searchbystore" => $sbs_res,
    "searchbyfood" => $con_ac["search"]?$sbf_res:[]
]);