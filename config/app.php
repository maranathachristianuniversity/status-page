<?php return [
    'const' => [
        'API' => $_SERVER['API'],
        'GATEWAY' => $_SERVER['GATEWAY']
    ],
    'cache' => [
        'kind' => 'MEMCACHED',
        'expired' => 100,
        'host' => 'localhost',
        'port' => 11211,
    ],
    'logs' => [
        'slack' => [
            'url' => $_SERVER['SLACK'],
            'secure' => '',
            'username' => 'status-page',
            'active' => false
        ],
        'hook' => [
            'url' => $_SERVER['HOOK'],
            'secure' => '',
            'username' => 'status-page',
            'active' => false
        ]
    ]
];