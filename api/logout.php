<?php

session_destroy();

require_once('includes/restful_json.php');
require_once('includes/tokengen.php');

$reqdata = json_req_body();

remove_token($reqdata->uid);

json_res(array(
    "status" => 0
));