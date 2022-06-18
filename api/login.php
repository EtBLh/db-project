<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

$postdata = json_req_body();

$pw = hash('sha256', $postdata->pw);

$stmt = $conn->prepare('SELECT * FROM user WHERE account = ? AND password = ?');
$stmt->bind_param("ss", $postdata->ac, $pw);

$res = array();
if ($stmt->execute()){
    $result = $stmt->get_result();
    $user_data = $result->fetch_assoc();
    if ($user_data) {
        $token = tokengen();
        $token_status = register_token($token, $user_data['uid']);
        $res = array(
            'status' => 0,
            'uid' => $user_data['uid'],
            'token' => $token,
            'error' => $token_status
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