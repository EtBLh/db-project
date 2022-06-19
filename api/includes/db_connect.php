<?php

$servername = "localhost";
$username   = "ubereat";
$password   = "24tXOaAtXX42vBUc";
$table      = "ubereat";

$conn = new mysqli($servername, $username, $password, $table);

if ($conn->connect_error){
    die("connection failed:" . $conn->connect_error);
}