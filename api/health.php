<?php
require __DIR__ . '/bootstrap.php';

$config = loadConfig();
jsonResponse(200, [
    'ok' => true,
    'pixConfigured' => getApiKey($config) !== ''
]);
