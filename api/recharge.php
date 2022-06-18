<?php

/*
status
0: success
1: auth fail
2: data format does not meet requirement
3: database error
4: amount does not meet requirement
5: recharge amount can not be less than or equal to 0
6: recharge error

request
{
    uid
    token
    amount
}

response
{
    status
}
*/

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/create_transaction_record.php");

$reqdata = json_req_body();
if (!$reqdata->token || !$reqdata->uid || !$reqdata->amount){
    json_res(array("status" => 2)); //data format not satified
    exit();
}
if (!check_token($reqdata->token, $reqdata->uid)) {
    json_res(array("status" => 1)); //auth fail
    exit();
}

if (!preg_match("/^[0-9]+$/", $reqdata->amount)) {
    $res = array(
        'status' => 4
    );
    json_res($res);
    exit();
} 
if ($reqdata->amount <= 0) {
    json_res(array(
        'status' => 5
    ));
    exit();
}

$stmt = $conn->prepare("UPDATE user SET balance = (balance + ?) WHERE uid = ?");
$stmt->bind_param("ii", $reqdata->amount, $reqdata->uid);

if ($stmt->execute()) {
    if (!create_transaction_record($conn, $reqdata->uid, $reqdata->uid, "recharge", $reqdata->amount)) {
        $res = array(
            'status' => 6
        );
    }
    $res = array(
        'status' => 0
    );
} else {
    $res = array(
        'status' => 3, // database error
        'error' => $stmt->error
    );
}

json_res($res);