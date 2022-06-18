<?php

const MAX_INT = 2147483647;

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/loc2pos.php");

$reqdata = json_req_body();
$f = $reqdata->filter;

$searchbystore = "SELECT sid, name, class, owner, ST_AsText(location) as location FROM store WHERE
                (sid IN (SELECT sid from store WHERE ST_Distance_Sphere((SELECT user.location FROM user WHERE uid = ?), location) <= ?) OR NOT ?) AND
                (class LIKE CONCAT('%',?,'%') OR NOT ?) AND
                (sid IN (SELECT store from food WHERE price <= ?) OR NOT ?) AND
                (sid IN (SELECT store from food WHERE price >= ?) OR NOT ?) AND
                (name LIKE CONCAT('%',?,'%') OR NOT ?);";

$searchbyfood = "SELECT sid, name, class, owner, ST_AsText(location) as location FROM store WHERE 
                (sid IN (SELECT sid from store WHERE ST_Distance_Sphere((SELECT user.location FROM user WHERE uid = ?), location) <= ?) OR NOT ?) AND
                (class LIKE CONCAT('%',?,'%') OR NOT ?) AND
                (sid IN (SELECT store from food WHERE price <= ?) OR NOT ?) AND
                (sid IN (SELECT store from food WHERE price >= ?) OR NOT ?) AND
                (sid IN (SELECT store from food WHERE name LIKE CONCAT('%',?,'%')) OR NOT ?);";


$sbs_stmt = $conn->prepare($searchbystore);
$sbf_stmt = $conn->prepare($searchbyfood);

$f_default = [
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
    "search" => $reqdata->search != ""
];

$param = [
    "uid" => $reqdata->uid,
    "dist" => $con_ac["dist"]?$f->distance:$f_default["dist"],
    "class" => $con_ac["class"]?$f->class:$f_default["class"],
    "pricelow" => $con_ac["pricelow"]?$f->pricelow:$f_default["pricelow"],
    "pricehigh" => $con_ac["pricehigh"]?$f->pricehigh:$f_default["pricehigh"],
    "search" => $con_ac["search"]?$reqdata->search:"",
];

$sbs_stmt->bind_param("idisiiiiisi",
    $param["uid"], $param["dist"], $con_ac["dist"],
    $param["class"], $con_ac["class"],
    $param["pricehigh"], $con_ac["pricehigh"],
    $param["pricelow"], $con_ac["pricelow"],
    $param["search"], $con_ac["search"]
);

$sbf_stmt->bind_param("idisiiiiisi",
    $param["uid"], $param["dist"], $con_ac["dist"],
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
        $pos = loc2pos($row["location"]);
        $sbs_res[] = [
            "sid" => $row["sid"],
            "name" => $row["name"],
            "class" => $row["class"],
            "owner" => $row["owner"],
            "long" => $pos["long"],
            "lat" => $pos["lat"],
        ];
    }
} else {
    $sbs_res = array(
        'status' => 1,
        'error' => $sbs_stmt->error
    ); 
}

if ($con_ac["search"]){
    $sbf_res = array(); 
    if ($sbf_stmt->execute()){
        $result = $sbf_stmt->get_result();
        $sbf_res = [];
        while($row = mysqli_fetch_array($result)){
            $pos = loc2pos($row["location"]);
            $sbf_res[] = [
                "sid" => $row["sid"],
                "name" => $row["name"],
                "class" => $row["class"],
                "owner" => $row["owner"],
                "long" => $pos["long"],
                "lat" => $pos["lat"],
            ];
        }
    } else {
        $sbf_res = array(
            'status' => 1,
            'error' => $sbf_stmt->error
        ); 
    }
}

json_res([
    "searchbystore" => $sbs_res,
    "searchbyfood" => $con_ac["search"]?$sbf_res:[]
]);
exit;