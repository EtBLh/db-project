<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/check_location.php");

/**
 * status
 * 7: location does not meet requirement
 */

$reqdata = json_req_body();
if (!$reqdata->token || !$reqdata->uid){
    json_res(array(
        'status' => 1
    ));
    exit();
}
if (!check_token($reqdata->token, $reqdata->uid)) {
    json_res(array(
        'status' => 2
    ));
    exit();
}

if (!check_loc($reqdata->long, $reqdata->lat)) {
    json_res(array(
        "status" => 7 //location does not meet requiremnt
    ));
    exit();
}
$location = 'POINT(' . $reqdata->long . ' ' . $reqdata->lat . ')';

$sql_query = 'INSERT INTO store (name, location, class, owner) VALUES (?, ST_GeomFromText(?), ?, ?);';
$stmt = $conn->prepare($sql_query);
$stmt->bind_param('sssi', $reqdata->name, $location, $reqdata->class, $reqdata->uid);

$res = array();

if ($stmt->execute()){
    $result = $stmt->get_result();
    $res = mysqli_fetch_array($result);
    $res["status"] = 0;
} else {
    $res = array(
        'status' => 3,
        'error' => $stmt->error
    );
} 

json_res($res);