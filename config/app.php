<?php return [
    'cache' => array(
        'identifier' => 'pukocache',
        'kind' => 'MEMCACHED',
        'expired' => 100,
        'host' => 'localhost',
        'port' => 11211,
    ),
    'const' => array(
        'API' => 'http://10.15.104.99:9102/',
        'GATEWAY' => 'http://10.15.104.99/'
    ),
    'logs' => array(
        'active' => false,
        'driver' => 'slack',
        'url' => '',
        'username' => 'puko',
        'emoji' => ':boom:',
        'level' => 'critical'
    )
];