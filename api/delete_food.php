<?php

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
    json_res([
        "status" => 456
    ]);
    exit();
}

$sql_query = 'DELETE FROM food WHERE name = ? and store = (SELECT sid from store WHERE owner = ?)';
$stmt = $conn->prepare($sql_query);
$stmt->bind_param('si', $reqdata->name, $reqdata->uid);

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