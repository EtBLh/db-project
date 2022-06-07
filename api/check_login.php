<?php

require_once "includes/tokengen.php";
require_once "includes/restful_json.php";

$reqbody = json_req_body();
$res = array();
if (!$reqbody || !$reqbody->token || !$reqbody->uid || !isset($reqbody->token) || !isset($reqbody->uid)){
    $res = array("result" => false);
} else {
    $res = array("result" => check_token($reqbody->token, $reqbody->uid));
}
json_res($res);

exit();
