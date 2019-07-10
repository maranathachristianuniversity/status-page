<?php $routes = [
    "router" => [
        "" => [
            "controller" => "status",
            "function" => "pages",
            "accept" => [
                "GET",
                "POST"
            ]
        ],
        "manager" => [
            "controller" => "manager",
            "function" => "manager",
            "accept" => [
                "GET",
                "POST"
            ]
        ],
        "login" => [
            "controller" => "users",
            "function" => "login",
            "accept" => [
                "GET",
                "POST"
            ]
        ],
        "register" => [
            "controller" => "users",
            "function" => "register",
            "accept" => [
                "GET",
                "POST"
            ]
        ]
    ],
    "error" => [
        "controller" => "error",
        "function" => "display",
        "accept" => [
            "GET",
            "POST"
        ]
    ],
    "not_found" => [
        "controller" => "error",
        "function" => "notfound",
        "accept" => [
            "GET",
            "POST"
        ]
    ]
]; return $routes;