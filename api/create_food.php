<?php

/*
1:
2: empty entry
3: price format error
4: name format error
5: amount format error
6: image format error
*/

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

$reqdata = json_req_body();

if (!$reqdata->token || !$reqdata->uid){
    json_res([
        "data" => var_export($reqdata, true)
    ]);
    exit();
}
if (!check_token($reqdata->token, $reqdata->uid)) {
    json_res($reqdata);
    exit();
}
if (!$reqdata->thumbnail || !$reqdata->price || !$reqdata->amount || !$reqdata->name) {
    json_res([
        "status" => 2
    ]);
    exit;
}
if (!preg_match('/^[0-9]+$/',$reqdata->price)) {
    json_res([
        "status" => 3
    ]);
    exit();
}
if (!preg_match('/^[0-9a-zA-Z]+$/',$reqdata->name)) {
    json_res([
        "status" => 4
    ]);
    exit();
}
if (!preg_match('/^[0-9]+$/',$reqdata->amount)) {
    json_res([
        "status" => 5
    ]);
    exit();
}

$sql_query = 'INSERT INTO food (name, thumbnail, price, amount, store) VALUES (?,?,?,?,(SELECT sid FROM store WHERE owner = ? ))';
$stmt = $conn->prepare($sql_query);
$stmt->bind_param('ssiii', $reqdata->name, $reqdata->thumbnail, $reqdata->price, $reqdata->amount, $reqdata->uid);

$res = array();
if ($stmt->execute()){
    $result = $stmt->get_result();
    $res = mysqli_fetch_array($result);
    $res["status"] = 0;
} else {
    $res = array(
        'status' => 1,
        'error' => $stmt->error
    ); 
}

json_res($res);