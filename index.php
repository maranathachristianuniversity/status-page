<?php
/*
 *---------------------------------------------------------------
 * SAT FRAMEWORK
 *---------------------------------------------------------------
 *
 */

use satframework\Framework;
use satframework\config\Factory;

require 'vendor/autoload.php';

/*
 *---------------------------------------------------------------
 * APP BASE URL
 *---------------------------------------------------------------
 *
 */
$protocol = 'http';
if (isset($_SERVER['HTTPS'])) {
    $protocol = 'https';
} else if (isset($_SERVER['HTTP_X_SCHEME'])) {
    $protocol = strtolower($_SERVER['HTTP_X_SCHEME']);
} else if (isset($_SERVER['HTTP_X_FORWARDED_PROTO'])) {
    $protocol = strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']);
} else if (isset($_SERVER['SERVER_PORT'])) {
    $serverPort = (int)$_SERVER['SERVER_PORT'];
    if ($serverPort == 80) {
        $protocol = 'http';
    } else if ($serverPort == 443) {
        $protocol = 'https';
    }
}

$factory = array(
    'cli_param' => null,
    'environment' => 'DEV',
    'base' => ($protocol . "://" . $_SERVER['HTTP_HOST'] . "/"),
    'root' => __DIR__,
    'start' => microtime(true)
);

$fo = new Factory($factory);

//Initialize framework object
$framework = new Framework($fo);
//Start framework
$framework->Start();
