<?php

/*
order status: 
1: not finished
2: canceled
3: done

action:
0: cancel
1: finish

status:
    0: success
    1: reqdata does not meet requirement
    2: auth error
    3: database error
    4: user is not authenticated to cancel the order
    5: user is not authenticated to finish the order
    7: some order selected is already finished or canceled (all update request are denied)º
    8: no such order
    10: transaction error

request
{
    uid
    token
    orders: [
        oid, ...
    ]
    action: 0|1
}

response
{
    status
}
*/

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/transaction.php");
require_once("includes/create_transaction_record.php");

$reqdata = json_req_body();
if (!$reqdata->token || !$reqdata->uid || $reqdata->orders === NULL || $reqdata->action === NULL) {
    json_res([
        'status' => 1
    ]);
    exit();
}
if (!check_token($reqdata->token, $reqdata->uid)) {
    json_res(array(
        'status' => 2
    ));
    exit();
}

if ($reqdata->action == 0) { // cancel order
    $conn->begin_transaction();
    try {
        $client = 0; 
        $shop_keeper = 0;
        $total = 0;
        // check
        foreach ($reqdata->orders as $oid) {
            // check if canceller is the client of the order 
            $stmt = $conn->prepare("SELECT user, total, `status` FROM `order` WHERE oid = ?");
            $stmt->bind_param("i", $oid);
            if (!$stmt->execute()) {
                json_res(array(
                    'status' => 3,
                    'error' => $stmt->error
                ));
                exit();
            }
            $result = $stmt->get_result();
            $order_result = mysqli_fetch_array($result);
            if (!$order_result) {
                json_res(array(
                    'status' => 8
                ));
                exit();
            }
            $client = $order_result[user];
            $total = $order_result[total];
            $status = $order_result[status];
            // check if canceller is the shop keeper of the order
            $stmt = $conn->prepare("SELECT owner FROM store WHERE (sid = (SELECT store FROM `order` WHERE oid = ?))");
            $stmt->bind_param("i", $oid);
            if (!$stmt->execute()) {
                json_res(array(
                    'status' => 3,
                    'error' => $stmt->error
                ));
                exit();
            }
            $result = $stmt->get_result();
            $shop_keeper_result = mysqli_fetch_array($result);
            $shop_keeper = $shop_keeper_result[owner];
            
            if ($status != 1) {
                json_res(array(
                    'status' => 7
                ));
                exit();
            }
            if ($reqdata->uid != $client && $reqdata->uid != $shop_keeper) {
                json_res(array(
                    'status' => 4
                ));
                exit();
            }
        }
        foreach ($reqdata->orders as $oid) {
            // update order
            $stmt = $conn->prepare("UPDATE `order` SET `status` = 2, `end` = ? WHERE oid = ?");
            $stmt->bind_param("ii", strtotime("now"), $oid);
            if (!$stmt->execute()) {
                json_res(array(
                    'status' => 3,
                    'error' => $stmt->error
                ));
                exit();
            }
            // create two transaction
            if (!transaction($conn, $client, $shop_keeper, $total)) {
                json_res(array(
                    'status' => 10
                ));
                exit();
            }
            if (!create_transaction_record($conn, $client, $shop_keeper, "refund", $total)) {
                json_res(array(
                    'status' => 10
                ));
                exit();
            }
            if (!create_transaction_record($conn, $shop_keeper, $client, "refund", $total * (-1))) {
                json_res(array(
                    'status' => 10
                ));
                exit();
            }
        }
        $conn->commit();
    } catch (\Exception $e) {
        $conn->rollback();
        json_res(array(
            'status' => 6
        ));
        exit();
        throw $e;
    }
} else if ($reqdata->action == 1) { // finish order
    $conn->begin_transaction();
    try {
        foreach ($reqdata->orders as $oid) {
            // get order status
            $stmt = $conn->prepare("SELECT `status` FROM `order` WHERE oid = ?");
            $stmt->bind_param("i", $oid);
            if (!$stmt->execute()) {
                json_res(array(
                    'status' => 3,
                    'error' => $stmt->error
                ));
                exit();
            }
            $result = $stmt->get_result();
            $order_result = mysqli_fetch_array($result);
            $status = $order_result[status];
            if (!$order_result) {
                json_res(array(
                    'status' => 8
                ));
                exit();
            }
            if ($status != 1) {
                json_res(array(
                    'status' => 7
                ));
                exit();
            }

            $result = $stmt->get_result();
            $order_result = mysqli_fetch_array($result);
            $client = $order_result[user];

            // check if canceller is the shop keeper of the order
            $stmt = $conn->prepare("SELECT `owner` FROM store WHERE (sid = (SELECT store FROM `order` WHERE oid = ?))");
            $stmt->bind_param("i", $oid);
            if (!$stmt->execute()) {
                json_res(array(
                    'status' => 3,
                    'error' => $stmt->error
                ));
                exit();
            }
            $result = $stmt->get_result();
            $shop_keeper_result = mysqli_fetch_array($result);
            $shop_keeper = $shop_keeper_result[owner];
            
            if ($reqdata->uid != $shop_keeper) {
                json_res(array(
                    'status' => 5
                ));
                exit();
            }
        }
        foreach ($reqdata->orders as $oid) {
            // update order
            $stmt = $conn->prepare("UPDATE `order` SET `status` = 3, `end` = ? WHERE oid = ?");
            $stmt->bind_param("ii", strtotime("now"), $oid);
            if (!$stmt->execute()) {
                json_res(array(
                    'status' => 3,
                    'error' => $stmt->error
                ));
                exit();
            }
        }
        $conn->commit();
    } catch (\Exception $e) {
        $conn->rollback();
        json_res(array(
            'status' => 6
        ));
        exit();
        throw $e;
    }
}

json_res(array(
    'status' => 0
));