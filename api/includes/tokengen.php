<?php

# https://stackoverflow.com/questions/4356289/php-random-string-generator/31107425#31107425
# by Scott Arciszewski

/**
 * Generate a random string, using a cryptographically secure 
 * pseudorandom number generator (random_int)
 *
 * This function uses type hints now (PHP 7+ only), but it was originally
 * written for PHP 5 as well.
 * 
 * For PHP 7, random_int is a PHP core function
 * For PHP 5.x, depends on https://github.com/paragonie/random_compat
 * 
 * @param int $length      How many characters do we want?
 * @param string $keyspace A string of all possible characters
 *                         to select from
 * @return string
 */
function tokengen(
    int $length = 64,
    string $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
): string {
    if ($length < 1) {
        throw new \RangeException("Length must be a positive integer");
    }
    $pieces = [];
    $max = mb_strlen($keyspace, '8bit') - 1;
    for ($i = 0; $i < $length; ++$i) {
        $pieces []= $keyspace[random_int(0, $max)];
    }
    return implode('', $pieces);
}

require_once('db_connect.php');

function register_token($token, $uid){
    global $conn;
    $stmt = $conn->prepare('UPDATE user SET token = ?, token_expiry_time = ? WHERE uid = ?');
    $stmt->bind_param("sii", $token, strtotime("30 minutes"), $uid);
    $status = $stmt->execute();
    return $stmt->error;
}

function check_token($token, $uid){
    global $conn;
    $stmt = $conn->prepare('SELECT * FROM user WHERE uid = ? AND token = ? AND token_expiry_time > ?');
    $time_now = strtotime("now");
    $stmt->bind_param("isi", $uid, $token, $time_now);

    if ($stmt->execute()){
        $result = $stmt->get_result();
        $user_data = $result->fetch_assoc();
        if ($user_data) return true;
        else return false;
    } else {
        return $stmt->error;
        return false; 
    }
}

function remove_token($uid){
    global $conn;
    $stmt = $conn->prepare('UPDATE user SET token = NULL, token_expiry_time = NULL WHERE uid = ?');
    $stmt->bind_param("i", $uid);

    return $stmt->execute();
}

function token_renew($uid){
    global $conn;
    $stmt = $conn->prepare('UPDATE user SET token = NULL, token_expiry_time = NULL WHERE uid = ?');
    $stmt->bind_param("i", $uid);

    return $stmt->execute();
}