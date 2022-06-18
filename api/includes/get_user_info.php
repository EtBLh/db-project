<?php

require_once("includes/db_connect.php");

function get_user_info($uid) {
    global $conn;
    $stmt = $conn->prepare('SELECT *, ST_AsText(location) as location FROM user WHERE uid = ?');
    $stmt->bind_param("i", $uid);

    $user_data = array();
    if ($stmt->execute()){
        $result = $stmt->get_result();
        $user_data = $result->fetch_assoc();
        return $user_data;
    } else {
        return false;
    }
    return $user_data;
}