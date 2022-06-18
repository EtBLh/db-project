<?php

require_once("includes/db_connect.php");
require_once("includes/tokengen.php");
require_once("includes/restful_json.php");

function create_transaction_record($conn, $user, $trader, $action, $amount) {
    $stmt = $conn->prepare("INSERT INTO `transaction` (`user`, trader, `action`, `time`, `amount`) VALUES (?, ?, ?, ?, ?)");
    $stmt->bind_param("iisii", $user, $trader, $action, strtotime("now"), $amount);

    if (!$stmt->execute()) {
        return false;
    }
    return true;
}