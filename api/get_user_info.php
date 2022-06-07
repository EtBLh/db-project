<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

$reqdata = json_req_body();
if (!$reqdata->token || !$reqdata->uid){
    json_res($reqdata);
    exit();
}
if (!check_token($reqdata->token, $reqdata->uid)) {
    json_res($reqdata);
    exit();
}

$stmt = $conn->prepare('SELECT * FROM user WHERE uid = ?');
$stmt->bind_param("i", $reqdata->uid);

$res = array();
if ($stmt->execute()){
    $result = $stmt->get_result();
    $user_data = $result->fetch_assoc();
    if ($user_data) {
        $res = array(
            'status' => 0,
            'uid' => $user_data['uid'],
            'ac' => $user_data['account'],
            'name' => $user_data['name'],
            'phone' => $user_data['phone'],
            'long' => $user_data['longtitude'],
            'lat' => $user_data['latitude'],
        );
    } else {
        $res = array(
            'status' => 2 //no such user
        );
    }
} else {
    $res = array(
        'status' => 1,
        'error' => $stmt->error
    ); 
}

json_res($res);