<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/get_shop_info.php");

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

$sid = $reqdata->store;
$res = get_shop_info($sid);
if ($res){
    $res["status"] = 0;
} else {
    $res = [
        "status" => 1
    ];
}

json_res($res);