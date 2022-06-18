<?php

/*
filter: 
0: all
1: not finished
2: canceled
3: done

request
{
    uid
    token
    filter: {
        status: 0|1|2|3
    }
}

status
0: success
1: incomplete request
2: quth fail
3: database error
4: filter type format error

response
{
    status
    orders: [
        {
            oid
            status
            total
            store
            storename
            start
            end
            food: [
                {
                    fid
                    name
                    quantity
                    thumbnail
                    price
                }
                ...
            ] or null
        }
        ...
    ] or null
}
*/

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/get_order_detail.php");

$reqdata = json_req_body();

if (!$reqdata->token || !$reqdata->uid || $reqdata->filter === NULL){
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

$sql_query = 'SELECT * FROM `order` WHERE user = ?';
// select query
if ($reqdata->filter->type == 1) {
    $sql_query = 'SELECT * FROM `order` WHERE user = ? and `status` = 1';
} else if ($reqdata->filter->type == 2) {
    $sql_query = 'SELECT * FROM `order` WHERE user = ? and `status` = 2';
} else if ($reqdata->filter->type == 3) {
    $sql_query = 'SELECT * FROM `order` WHERE user = ? and `status` = 3';
} else if ($reqdata->filter == [] || !$reqdata->filter || !$reqdata->filter->type || $reqdata->filter->type == 0) {
} else {
    json_res([
        'status' => 4
    ]);
    exit();
}
$stmt = $conn->prepare($sql_query);
$stmt->bind_param('i', $reqdata->uid);

$res = array();
if ($stmt->execute()){
    $result = $stmt->get_result();
    $orders = [];
    $shop_name = "";
    while($row = mysqli_fetch_array($result)){
        $shop_stmt = $conn->prepare("SELECT name FROM store WHERE sid = ?");
        $shop_stmt->bind_param("i", $row["store"]);
        if ($shop_stmt->execute()) {
            $shop_result = $shop_stmt->get_result();
            $shop_data = mysqli_fetch_array($shop_result);
            $shop_name = $shop_data[name];
        }

        $end_time = ($row["end"]) ? gmdate("M d Y H:i:s", $row["end"]) : 0;

        $items = get_order_detail($conn, $row["oid"]);
        if ($items === false) {
            json_res(array(
                'status' => 3,
            ));
            exit(); 
        }

        $order = [
            "oid" => $row["oid"],
            "status" => $row["status"],
            "total" => $row["total"],
            "subtotal" => $row["total"] - $row["delivery_fee"],
            "delivery_fee" => $row["delivery_fee"],
            "store" => $row["store"],
            "storename" => $shop_name,
            "items" => $items,
            "user" => $row["user"],
            "start" => gmdate("M d Y H:i:s", $row["start"]),
            "end" => $end_time
        ];
        $orders[] = $order;
    }
} else {
    json_res(array(
        'status' => 3,
        'error' => $stmt->error
    ));
    exit(); 
}

json_res(array(
    'status' => 0,
    'orders' => $orders
));