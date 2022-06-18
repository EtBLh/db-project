<?php

require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/get_user_info.php");
require_once("includes/loc2pos.php");

/**
 * status 
 * 1: sql stmt error
 */

$reqdata = json_req_body();
if (!$reqdata->token || !$reqdata->uid){
    json_res($reqdata);
    exit();
}
if (!check_token($reqdata->token, $reqdata->uid)) {
    json_res($reqdata);
    exit();
}

$uid = $reqdata->uid;
$user_data = get_user_info($uid);
$res = [];

if ($user_data === false){
    $res = array(
        'status' => 1
        // 'error' => $stmt->error
    ); 
} else if ($user_data !== []) {
    $pos = loc2pos($user_data["location"]);
    $res = array(
        'status' => 0,
        'uid' => $user_data['uid'],
        'ac' => $user_data['account'],
        'name' => $user_data['name'],
        'phone' => $user_data['phone'],
        'long' => $pos['long'],
        'lat' => $pos['lat'],
        'balance' => $user_data['balance']
    );
} else {
    $res = array(
        'status' => 2 //no such user
    );
}

json_res($res);
exit;