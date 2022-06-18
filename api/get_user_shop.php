<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/loc2pos.php");

/*
response
{
    很多
}
*/

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

$sql_query = 'SELECT *, ST_AsText(location) as location FROM store WHERE `owner` = ?';
$stmt = $conn->prepare($sql_query);
$stmt->bind_param('i', $reqdata->uid);

$data = array();
$exist = false;
if ($stmt->execute()){
    $result = $stmt->get_result();
    $res = mysqli_fetch_array($result);
    $exist = ($res == []) ? false : true;
    $pos = loc2pos($res["location"]);
    $data = [
        "sid" => $res["sid"],
        "name" => $res["name"],
        "class" => $res["class"],
        "owner" => $res["owner"],
        "long" => $pos["long"],
        "lat" => $pos["lat"],
    ];
} else {
    json_res(array(
        'status' => 3,
        'error' => $stmt->error
    )); 
}

if ($exist) {
    json_res(array(
        'status' => 0,
        'exist' => $exist,
        'shop_info' => $data
    ));
} else {
    json_res(array(
        'status' => 0,
        'exist' => $exist
    ));
}