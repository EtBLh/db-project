<?php

require_once("loc2pos.php");
require_once("db_connect.php");

function get_shop_info($sid) {
    global $conn;
    $sql_query = 'SELECT *, ST_AsText(location) as location FROM store where sid = ?';
    $stmt = $conn->prepare($sql_query);
    $stmt->bind_param('i', $sid);

    $res = array();
    if ($stmt->execute()){
        $result = $stmt->get_result();
        $row = mysqli_fetch_array($result);
        $pos = loc2pos($row["location"]);
        $res = [
            "sid" => $row["sid"],
            "name" => $row["name"],
            "class" => $row["class"],
            "owner" => $row["owner"],
            "long" => $pos["long"],
            "lat" => $pos["lat"],
        ];
    } else {
        $res = false;
    }

    return $res;
}