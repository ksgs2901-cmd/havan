<?php
require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    jsonResponse(405, ['error' => 'Método não permitido']);
}

$paymentId = $_GET['id'] ?? '';
if ($paymentId === '') {
    jsonResponse(400, ['error' => 'ID do pagamento é obrigatório']);
}

$config = loadConfig();
$result = blackcatRequest($config, '/sales/' . rawurlencode($paymentId) . '/status', 'GET');
$sale = $result['data'] ?? [];

jsonResponse(200, [
    'paymentId' => $sale['transactionId'] ?? $paymentId,
    'status' => mapBlackcatStatus($sale['status'] ?? 'PENDING'),
    'rawStatus' => $sale['status'] ?? 'PENDING',
    'statusDetail' => $sale['status'] ?? 'PENDING',
]);
