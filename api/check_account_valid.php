<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

$reqdata = json_req_body();

if (!$reqdata->ac) {
    json_res([
        "status" => 2
    ]);
    exit();
}
// status 2: request parameter not satisfied 

$stmt = $conn->prepare('SELECT * FROM user WHERE account = ?');
$stmt->bind_param('s', $reqdata->ac);

$res = array();
if ($stmt->execute()) {
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
        'status' => 3, // sql error
        'error' => $stmt->error
    ); 
}

json_res($res);