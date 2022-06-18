<?php

//consume array as json body
function json_res($body){
    header('Content-type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type');
    echo json_encode($body);
}

//return object
function json_req_body(){
    $json = file_get_contents('php://input');
    $data = json_decode($json);
    return $data;
}