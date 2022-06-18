<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/transaction.php");
require_once("includes/create_transaction_record.php");

/*
order status: 
1: not finished
2: canceled
3: done

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
    9: duplicate order-food pair
    10: transaction fail

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

// get balance 
$usstmt = $conn->prepare("SELECT balance FROM user WHERE uid = ?");
$usstmt->bind_param("i", $reqdata->uid);
$usstmt->execute();
$baresult = $usstmt->get_result();
$usbalance = mysqli_fetch_array($baresult);
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
                    'status' => 6,
                    'data' => $row
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

    if ($usbalance < ($subtotal + $cost * $item->quantity + $delivery_fee)) {
        json_res(array(
            'status' => 8
        ));
        exit();
    } else {
        $subtotal = $subtotal + $cost * $item->quantity;
    }
} 
$total = $subtotal + $delivery_fee;

$get_owner_stmt = $conn->prepare("SELECT `owner` FROM store WHERE `sid` = ?");
$get_owner_stmt->bind_param("i", $reqdata->sid);
$uid = 0;
if ($get_owner_stmt->execute()) {
    $result = $get_owner_stmt->get_result();
    $uid_result = mysqli_fetch_array($result);
    $uid = $uid_result[owner];
} else {
    json_res(array(
        'status'=> 3,
        'error' => $get_owner_stmt->error
    ));
    exit();
}

$conn->begin_transaction();

// transaction
if (!transaction($conn, $uid, $reqdata->uid, $total)) {
    json_res(array(
        'status' => 10
    ));
    exit();
}
if (!create_transaction_record($conn, $uid, $reqdata->uid, "payment", $total * (-1))) {
    json_res(array(
        'status' => 10
    ));
    exit();
}
if (!create_transaction_record($conn, $reqdata->uid, $uid, "payment", $total)) {
    json_res(array(
        'status' => 10
    ));
    exit();
}

// insert an order 
$unfinish_status = 1;
$place_order_stmt = $conn->prepare("INSERT INTO `order` (`status`, `total`, `delivery_fee`, `store`, `user`, `start`) VALUES (?, ?, ?, ?, ?, ?)");
$place_order_stmt->bind_param("iiiiii", $unfinish_status, $total, $delivery_fee, $reqdata->sid, $reqdata->uid, strtotime("now"));
if (!$place_order_stmt->execute()) {
    json_res(array(
        'status'=> 3,
        'error' => $place_order_stmt->error
    ));
    exit();
}

// get last order's id 
$last_insert = $conn->prepare("SELECT LAST_INSERT_ID() as oid");
if (!$last_insert->execute()) {
    json_res(array(
        'status'=> 3,
        'error' => $last_insert->error
    ));   
    exit();
}
$oidresult = $last_insert->get_result();
$oid_result = mysqli_fetch_array($oidresult);
$oid = $oid_result[oid];

foreach ($reqdata->orderdetail as $item) {
    // insert orderdetail
    $get_food_ol_stmt = $conn->prepare("SELECT * FROM orderdetail WHERE (`food` = ? and `order` = ?)");
    $get_food_ol_stmt->bind_param("ii", $item->fid, $oid);
    if (!$get_food_ol_stmt->execute()) {
        json_res(array(
            'status'=> 3,
            'error' => $get_food_ol_stmt->error
        ));   
        exit();
    }
    $result = $get_food_ol_stmt->get_result();
    $row = mysqli_fetch_array($result);
    if ($row) {
        json_res(array(
            'status'=> 9
        ));   
        exit();
    }

    $orderlist_stmt = $conn->prepare("INSERT INTO `orderdetail` (`food`, `quantity`, `order`, `unit_price`) VALUES (?, ?, ?, (SELECT price FROM food WHERE fid = ?))");
    $orderlist_stmt->bind_param("iiii", $item->fid, $item->quantity, $oid, $item->fid);
    if (!$orderlist_stmt->execute()) {
        json_res(array(
            'status'=> 3,
            'error' => $orderlist_stmt->error
        ));   
        exit();
    }

    // update food table
    $update_food_stmt = $conn->prepare("UPDATE food SET amount = (amount - ?) WHERE fid = ?");
    $update_food_stmt->bind_param("ii", $item->quantity, $item->fid);
    if (!$update_food_stmt->execute()) {
        json_res(array(
            'status'=> 3,
            'error' => $update_food_stmt->error
        ));   
        exit();
    }
}

$conn->commit();

json_res(array(
    'status' => 0
));