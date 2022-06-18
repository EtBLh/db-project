<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

/*
status:
    0: success
    1: reqdata does not meet requirement
    2: auth error
    3: database error
    4: food DNE
    5: food quantity does not meet requirement
    6: shortage of stock
    7: food and the store it belongs to different from the given store
    8: user balance not enough

request:
{
    uid: int
    token: string
    sid: int
    delivery: boolean
    orderdetail: [
        {
            fid: int
            quantity: int
        }
        ...
    ]
}

response:
{
    status: 0
    total: unsigned int // delivery fee
    subtotal: unsigned int
    delivery_fee: unsigned int
} 
*/

$reqdata = json_req_body();
if (!$reqdata->token || !$reqdata->uid || !$reqdata->sid || !$reqdata->orderdetail || ($reqdata->delivery === NULL)){
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

// calculate delivery fee
$delivery_fee = 0;
if ($reqdata->delivery) {
    $stmt = $conn->prepare("SELECT ST_Distance_Sphere((SELECT location FROM user WHERE uid = ?), (SELECT location FROM store WHERE sid = ?)) as distance");
    $stmt->bind_param('ii', $reqdata->uid, $reqdata->sid);
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $rows = mysqli_fetch_array($result);
        $dist = $rows['distance'];
        $delivery_fee = round($dist / 1000 * 10);
        if ($delivery_fee < 10) {
            $delivery_fee = 10;
        }
    } else {
        $res = array(
            'status' => 3,
            'error' => $stmt->error
        ); 
        json_res($res);
        exit();
    }
} 

// execute the sql stmt and 
// 1. compare the given quantity to the one in db
// 2. check if user balance > total price
$subtotal = 0;
$total = 0;
foreach ($reqdata->orderdetail as $item) {
    // check if quantity meet requirement 
    if (is_string($item->quantity) || !is_numeric($item->quantity) || $item->quantity < 0) {
        json_res(array(
            'status' => 5
        ));
        exit();
    }

    $stmt = $conn->prepare("SELECT amount, price, store FROM food WHERE fid = ?");
    $stmt->bind_param("i", $item->fid);
    $cost = 0;
    if ($stmt->execute()) {
        $result = $stmt->get_result();
        $row = mysqli_fetch_array($result);
        if (!$row) {
            json_res(array(
                'status' => 4
            ));
            exit();
        } else {
            if ($item->quantity > $row["amount"]) {
                json_res(array(
                    'status' => 6
                ));
                exit();
            } else if ($row["store"] != $reqdata->sid) {
                json_res(array(
                    'status' => 7
                ));
                exit();
            } else {
                $cost = $row["price"];
            }
        }
    } else {
        json_res(array(
            'status' => 3,
            'error' => $stmt->error
        ));
        exit();
    }
    // check balance is enough
    $usstmt = $conn->prepare("SELECT balance FROM user WHERE uid = ?");
    $usstmt->bind_param("i", $reqdata->uid);
    $usstmt->execute();
    $baresult = $usstmt->get_result();
    $usbalance = mysqli_fetch_array($baresult);
    if ($usbalance < ($subtotal + $cost * $item->quantity + $fee)) {
        json_res(array(
            'status' => 8
        ));
        exit();
    } else {
        $subtotal = $subtotal + $cost * $item->quantity;
    }
} 
$total = $subtotal + $delivery_fee;

$res = array(
    'status' => 0,
    'subtotal' => $subtotal,
    'delivery_fee' => $delivery_fee,
    'total' => $total
);

json_res($res);