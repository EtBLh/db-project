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

$stmt = $conn->prepare('UPDATE food SET price=?, amount=? WHERE name = ? AND store = (SELECT sid from store WHERE owner = ?)');
$stmt->bind_param("iisi",$reqdata->price, $reqdata->amount, $reqdata->name, $reqdata->uid);

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