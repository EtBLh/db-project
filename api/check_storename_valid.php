<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

$reqdata = json_req_body();
if (!$reqdata->token || !$reqdata->uid || !$reqdata->name){
    json_res([
        "status" => 3
    ]);
    exit();
}
if (!check_token($reqdata->token, $reqdata->uid)) {
    json_res($reqdata);
    exit();
} 

$sql_query = 'SELECT * FROM store where name = ?';
$stmt = $conn->prepare($sql_query);
$stmt->bind_param('s', $reqdata->name);

$res = array();
if ($stmt->execute()){
    $result = $stmt->get_result()->fetch_assoc();
    if ($result) {
        $res = array(
            "status" => 0,
            "exist" => true
        );
    } else {
        $res = array(
            "status" => 0,
            "exist" => false
        );
    }
} else {
    $res = array(
        'status' => 1,
        'error' => $stmt->error
    ); 
}

json_res($res);