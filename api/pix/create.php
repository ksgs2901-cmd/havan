<?php
require __DIR__ . '/../bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(405, ['error' => 'Método não permitido']);
}

$config = loadConfig();
$body = readJsonBody();

$amount = (float) ($body['amount'] ?? 0);
$email = trim((string) ($body['email'] ?? ''));
$name = trim((string) ($body['name'] ?? ''));
$cpf = onlyDigits($body['cpf'] ?? '');
$phone = onlyDigits($body['phone'] ?? '');
$productName = trim((string) ($body['productName'] ?? $body['description'] ?? 'Pedido Havan'));
$productQty = max(1, (int) ($body['productQty'] ?? 1));
$shipping = is_array($body['shipping'] ?? null) ? $body['shipping'] : null;

if ($amount <= 0) jsonResponse(400, ['error' => 'Valor do pedido inválido']);
if ($email === '') jsonResponse(400, ['error' => 'E-mail do pagador é obrigatório']);
if ($name === '') jsonResponse(400, ['error' => 'Nome do pagador é obrigatório']);
if (strlen($cpf) !== 11) jsonResponse(400, ['error' => 'CPF inválido']);
if (strlen($phone) < 10) jsonResponse(400, ['error' => 'Telefone inválido']);

$amountCents = (int) round($amount * 100);
$unitPriceCents = (int) round($amountCents / $productQty);

$payload = [
    'amount' => $amountCents,
    'currency' => 'BRL',
    'paymentMethod' => 'pix',
    'items' => [[
        'title' => $productName,
        'unitPrice' => $unitPriceCents,
        'quantity' => $productQty,
        'tangible' => true,
    ]],
    'customer' => [
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'document' => ['number' => $cpf, 'type' => 'cpf'],
    ],
    'pix' => ['expiresInDays' => 1],
    'externalRef' => 'HV-' . bin2hex(random_bytes(8)),
];

if ($shipping) {
    $zipCode = onlyDigits($shipping['cep'] ?? '');
    $state = strtoupper(trim((string) ($shipping['estado'] ?? '')));

    if (
        empty($shipping['endereco']) || empty($shipping['numero']) ||
        empty($shipping['bairro']) || empty($shipping['cidade']) ||
        $state === '' || strlen($zipCode) !== 8
    ) {
        jsonResponse(400, ['error' => 'Dados de entrega incompletos']);
    }

    $payload['shipping'] = [
        'name' => $name,
        'street' => $shipping['endereco'],
        'number' => (string) $shipping['numero'],
        'neighborhood' => $shipping['bairro'],
        'city' => $shipping['cidade'],
        'state' => $state,
        'zipCode' => $zipCode,
    ];

    if (!empty($shipping['complemento'])) {
        $payload['shipping']['complement'] = $shipping['complemento'];
    }
}

$result = blackcatRequest($config, '/sales/create-sale', 'POST', $payload);
$sale = $result['data'] ?? [];
$paymentData = $sale['paymentData'] ?? [];
$pixCode = $paymentData['copyPaste'] ?? $paymentData['qrCode'] ?? '';

jsonResponse(200, [
    'paymentId' => $sale['transactionId'] ?? null,
    'status' => mapBlackcatStatus($sale['status'] ?? 'PENDING'),
    'rawStatus' => $sale['status'] ?? 'PENDING',
    'qrCode' => $pixCode,
    'qrCodeBase64' => buildQrBase64($pixCode, $paymentData),
    'invoiceUrl' => $sale['invoiceUrl'] ?? null,
    'expiresAt' => $paymentData['expiresAt'] ?? null,
]);
