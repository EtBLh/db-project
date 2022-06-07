<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

$reqdata = json_req_body();
if (!$reqdata->token || !$reqdata->uid){
    json_res(array("status" => 2)); //data format not satified
    exit();
}
if (!check_token($reqdata->token, $reqdata->uid)) {
    json_res(array("status" => 1)); //auth fail
    exit();
}

$stmt = $conn->prepare('UPDATE user SET longtitude=?, latitude=? WHERE uid = ?');
$stmt->bind_param("ddi",$reqdata->longtitude, $reqdata->latitude, $reqdata->uid);

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