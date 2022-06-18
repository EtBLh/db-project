<?php

// uid1 <- uid2
function transaction($conn, $uid1, $uid2, $amount) {
    if ($conn -> connect_errno) {
        return false;
    }
    
    $conn->begin_transaction();
    try {
        $update_owner_stmt = $conn->prepare("UPDATE user SET balance = balance + ? WHERE uid = ?");
        $update_owner_stmt->bind_param("ii", $total, $reqdata->uid1);
        $update_owner_stmt->execute();
    
        $update_user_stmt = $conn->prepare("UPDATE user SET balance = (balance - ?) WHERE uid = ?");
        $update_user_stmt->bind_param("ii", $total, $reqdata->uid2);
        $update_user_stmt->execute();
    
        $conn->commit();
    } catch (\Exception $e) {
        $conn->rollback();
        throw $e;
    }

    return true;
}