<?php

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

$sql_query = 'SELECT fid, name, amount, price, thumbnail FROM food where store = ?';
$stmt = $conn->prepare($sql_query);
$stmt->bind_param('i', $reqdata->store);

$res = array();
if ($stmt->execute()){
    $result = $stmt->get_result();
    $res = [];
    while($row = mysqli_fetch_array($result)){
        $food = [
            "fid" => $row["fid"],
            "name" => $row["name"],
            "amount" => $row["amount"],
            "price" => $row["price"],
            "thumbnail" => $row["thumbnail"],
        ];
        $res[] = $food;
    }
} else {
    $res = array(
        'status' => 3,
        'error' => $stmt->error
    ); 
}

json_res($res);