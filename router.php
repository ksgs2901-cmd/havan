<?php

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

$routes = [
    '/api/health' => __DIR__ . '/api/health.php',
    '/api/pix/create' => __DIR__ . '/api/pix/create.php',
];

if (isset($routes[$path])) {
    require $routes[$path];
    return true;
}

if (preg_match('#^/api/pix/status/([^/]+)$#', $path, $matches)) {
    $_GET['id'] = $matches[1];
    require __DIR__ . '/api/pix/status.php';
    return true;
}

$file = __DIR__ . $path;
if ($path !== '/' && is_file($file)) {
    return false;
}

if (is_file(__DIR__ . '/index.html') && ($path === '/' || !pathinfo($path, PATHINFO_EXTENSION))) {
    require __DIR__ . '/index.html';
    return true;
}

return false;
