<?php

/*
status:
    0: success
    1: reqdata does not meet requirement
    2: auth error
    3: database error
    4: filter format error

request{
    uid
    token
    filter: {
        type: string ("recharge" || "income" || "outcome")
    }
}

response{
    status
    records: [
        {
            tid
            trader: string (shop name or user name returned depends on type of transaction)
            type
            time 
            amount
        }
        ...
        ] or null
    }
    */
    
// example code
// $timestamp = strtotime("now");
// print gmdate("Y-m-d H:i:s", $timestamp);

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

$reqdata = json_req_body();
if (!$reqdata->token || !$reqdata->uid){
    json_res([
        'status' => 1
    ]);
    exit();
}
if (!check_token($reqdata->token, $reqdata->uid)) {
    json_res([
        'status' => 2
    ]);
    exit();
}

$sql = "";
if ($reqdata->filter === NULL || !$reqdata->filter || $reqdata->filter->type == "all" || $reqdata->filter->type == "") { // all
    $sql = "SELECT * FROM `transaction` WHERE (`user` = ?)";
} else if ($reqdata->filter->type == "recharge") { // recharge
    $sql = "SELECT * FROM `transaction` WHERE (`user` = ? and `user` = `trader`) and action = \"recharge\"";
} else if ($reqdata->filter->type == "income") { // income
    $sql = "SELECT * FROM `transaction` WHERE (`user` = ? and amount < 0)";
} else if ($reqdata->filter->type == "outcome") { // outcome
    $sql = "SELECT * FROM `transaction` WHERE (`user` = ? and amount >= 0) and action != \"recharge\"";
} else {
    json_res([
        'status' => 4
    ]);
    exit();
}
$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $reqdata->uid);
$records = [];
$trader = "";
if ($stmt->execute()) {
    $result = $stmt->get_result();
    while ($record = mysqli_fetch_array($result)){
        // decide what trader to be displayed
        if ($record["action"] == "payment" && $record["amount"] < 0
            || $record["action"] == "refund" && $record["amount"] > 0) {
            $shop_name_stmt = $conn->prepare("SELECT `name` FROM store WHERE `owner` = ?");
            $shop_name_stmt->bind_param("i", $record["trader"]);
            if (!$shop_name_stmt->execute()) {
                json_res(array(
                    'status'=> 3,
                    'error' => $shop_name_stmt->error
                ));
                exit();
            }
            $shop_name_result = $shop_name_stmt->get_result();
            $shop_name = mysqli_fetch_array($shop_name_result);
            $trader = $shop_name["name"];
        } else {
            $user_name_stmt = $conn->prepare("SELECT `name` FROM `user` WHERE `uid` = ?");
            $user_name_stmt->bind_param("i", $record["trader"]);
            if (!$user_name_stmt->execute()) {
                json_res(array(
                    'status'=> 3,
                    'error' => $user_name_stmt->error
                ));
                exit();
            }
            $user_name_result = $user_name_stmt->get_result();
            $user_name = mysqli_fetch_array($user_name_result);
            $trader = $user_name["name"];
        }
        $record = [
            "tid" => $record["tid"],
            "trader" => $trader,
            "action" => $record["action"],
            "time" => gmdate("M d Y H:i:s", $record["time"]),
            "amount" => $record["amount"],
        ];
        $records[] = $record;
    }
} else {
    json_res(array(
        'status'=> 3,
        'error' => $stmt->error
    ));
    exit();
}

json_res(array(
    'status' => 0,
    'records' => $records
));
exit();