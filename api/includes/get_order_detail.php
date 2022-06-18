<?php

/*
request
{
    uid
    token
    oid
}

response
{
    status
    items: [
        {
            food name: string
            food thumbnail: string
            quantity: int
            unit_price: int
        }
        ...
    ]
}
*/

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

function get_order_detail($conn, $oid) {
    $sql_query = 'SELECT * FROM `orderdetail` where `order` = ?';
    $stmt = $conn->prepare($sql_query);
    $stmt->bind_param('i', $oid);
    $res = array();

    if ($stmt->execute()) {
        $result = $stmt->get_result();
        while ($row = mysqli_fetch_array($result)) {
            $food_stmt = $conn->prepare("SELECT `name`, thumbnail FROM food WHERE fid = ?");
            $food_stmt->bind_param("i", $row["food"]);
            if (!$food_stmt->execute()) {
                return false;
            }
            $food_result = $food_stmt->get_result();
            $food_info = mysqli_fetch_array($food_result);
            
            $item = [
                "fid" => $row["food"],
                "name" => $food_info['name'],
                "thumbnail" => $food_info['thumbnail'],
                "quantity" => $row["quantity"],
                "unit_price" => $row["unit_price"]
            ];
            $res[] = $item;
        }
    } else {
        return false;
    }
    return $res;
}