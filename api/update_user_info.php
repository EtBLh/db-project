<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/check_location.php");

$reqdata = json_req_body();
if (!$reqdata->token || !$reqdata->uid){
    json_res(array("status" => 2)); //data format not satified
    exit();
}
if (!check_token($reqdata->token, $reqdata->uid)) {
    json_res(array("status" => 1)); //auth fail
    exit();
}

if (!check_loc($reqdata->longtitude, $reqdata->latitude)) {
    json_res(array(
        "status" => 7 //location does not meet requiremnt
    ));
    exit();
}
$location = 'POINT(' . $reqdata->longtitude . ' ' . $reqdata->latitude . ')';
$stmt = $conn->prepare("UPDATE user SET location = ST_GeomFromText(?) WHERE uid = ?");
$stmt->bind_param("si",$location, $reqdata->uid);


$res = array();
if ($stmt->execute()){
    $res = array("status" => 0);
} else {
    $res = array(
        'status' => 3, //sql error
        'error' => $stmt->error
    ); 
}

json_res($res);