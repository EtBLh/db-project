<?php

/**
 * status code
 * 0: success
 * 1: unknown error
 * 2: empty field exists
 * 3: first name or last name does not meet requirement
 * 4: phone does not meet requirement
 * 5: password does not meet requirement
 * 6: account does not meet requirement
 * 7: location does not meet requirement
 * 8: account already exists
 */

/**
 * request{
 *  fname: string
 *  lname: string
 *  phone: string
 *  pw: string
 *  ac: string
 *  long: double
 *  lat: double
 * }
 * 
 * response{
 *  status: [status code above]
 *  error: null|[error msg]
 * }
 */

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");
require_once("includes/check_location.php");

$postdata = json_req_body();

//check if empty
if (!isset($postdata->ac) || !isset($postdata->pw) || 
    !isset($postdata->fname) || !isset($postdata->lname) || 
    !isset($postdata->phone) || !isset($postdata->long) || !isset($postdata->lat)) {
    json_res(array(
        "status" => 2, //empty field
        "reqbody" => var_export($postdata, true)
    ));
    exit();
};
if (!preg_match('/^[a-zA-Z]+$/',$postdata->fname) || !preg_match('/^[a-zA-Z]+$/',$postdata->lname)){
    json_res(array(
        "status" => 3 //first name or last name does not meet requirement
    ));
    exit();
}
if (!preg_match('/^09[0-9]{8}$/', $postdata->phone)){
    json_res(array(
        "status" => 4 //phone does not meet requiremnt
    ));
    exit();
}
if (!preg_match('/^[0-9a-zA-Z]+$/', $postdata->pw)){
    json_res(array(
        "status" => 5 //password does not meet requiremnt
    ));
    exit();
}
if (!preg_match('/^[0-9a-zA-Z]+$/', $postdata->ac)){
    json_res(array(
        "status" => 6 //account does not meet requiremnt
    ));
    exit();
}
if (!check_loc($postdata->long, $postdata->lat)) {
    json_res(array(
        "status" => 7 //location does not meet requiremnt
    ));
    exit();
}

// check if account exists
$fiae = $conn->prepare('SELECT * from user WHERE account = ?');
$fiae->bind_param('s', $postdata->ac);
$fstatus = $fiae->execute();
$fresult = $fiae->get_result()->fetch_assoc();
if ($fresult){
    json_res(array(
        "status" => 8, //account already exist
        "content" => var_export($fresult, true)
    ));
    exit(); 
}

//sign up

$pw = hash('sha256', $postdata->pw);
$name = $postdata->fname . ' ' . $postdata->lname;
$location = 'POINT(' . $postdata->long . ' ' . $postdata->lat . ')';

$stmt = $conn->prepare("INSERT INTO user (account, password, name, phone, location) VALUE (?, ?, ?, ?, ST_GeomFromText(?))");
$stmt->bind_param("sssss", $postdata->ac, $pw, $name, $postdata->phone, $location);
$status = $stmt->execute();

$res = array();
if ($status){
    $res = array(
        'status' => 0
    );
} else {
    $res = array(
        'status' => 1,
        'error' => $stmt->error,
        'req' => $postdata,
        'data' => "INSERT INTO user (account, password, name, phone, location) VALUE (?, ?, ?, ?, ST_GeomFromText('POINT(? ?)'))"
    );
}

json_res($res);