<?php return [
    'method'     => 'AES-256-CBC',
    'key'        => $_SERVER['SECRET_KEY'],
    'identifier' => 'anywhere',
    'cookies'    => 'anywhere',
    'session'    => 'anywhere',
    'expired'    => 9999,
    'expiredText'=> 'Login untuk melanjutkan',
    'errorText'  => 'Anda tidak memiliki hak akses',
];
