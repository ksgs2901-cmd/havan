<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function loadConfig(): array
{
    $localFile = __DIR__ . '/config.local.php';
    if (is_file($localFile)) {
        $config = require $localFile;
        if (is_array($config)) {
            return $config;
        }
    }

    $envFile = dirname(__DIR__) . '/.env';
    $config = [];
    if (is_file($envFile)) {
        foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
                continue;
            }
            [$key, $value] = explode('=', $line, 2);
            $config[trim($key)] = trim($value);
        }
    }

    return $config;
}

function jsonResponse(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function onlyDigits(?string $value): string
{
    return preg_replace('/\D+/', '', (string) $value);
}

function getApiKey(array $config): string
{
    return $config['BLACKCAT_SECRET_KEY'] ?? $config['BLACKCAT_API_KEY'] ?? '';
}

function mapBlackcatStatus(?string $status): string
{
    $normalized = strtoupper((string) $status);
    if ($normalized === 'PAID') return 'approved';
    if ($normalized === 'CANCELLED' || $normalized === 'REFUNDED') return 'cancelled';
    return 'pending';
}

function blackcatRequest(array $config, string $path, string $method = 'GET', ?array $body = null): array
{
    $apiKey = getApiKey($config);
    if ($apiKey === '') {
        jsonResponse(503, ['error' => 'PIX API não configurada. Defina BLACKCAT_SECRET_KEY no .env']);
    }

    $ch = curl_init('https://api.blackcatoficial.com/api' . $path);
    $headers = [
        'Content-Type: application/json',
        'X-API-Key: ' . $apiKey,
    ];

    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_TIMEOUT => 30,
    ]);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $data = json_decode((string) $raw, true) ?: [];

    if ($status < 200 || $status >= 300 || (($data['success'] ?? true) === false)) {
        $message = $data['message'] ?? $data['error'] ?? 'Erro na API BlackCat';
        jsonResponse($status >= 400 ? $status : 500, ['error' => $message]);
    }

    return $data;
}

function buildQrBase64(string $pixCode, array $paymentData): string
{
    $base64 = $paymentData['qrCodeBase64'] ?? '';
    if (is_string($base64) && str_starts_with($base64, 'data:image')) {
        $parts = explode(',', $base64, 2);
        return $parts[1] ?? '';
    }

    if ($pixCode === '') {
        return '';
    }

    if (!class_exists('QRcode')) {
        $lib = __DIR__ . '/phpqrcode/qrlib.php';
        if (is_file($lib)) {
            require_once $lib;
        }
    }

    if (class_exists('QRcode')) {
        ob_start();
        QRcode::png($pixCode, null, QR_ECLEVEL_M, 6, 1);
        $image = ob_get_clean();
        return base64_encode($image ?: '');
    }

    return '';
}

function readJsonBody(): array
{
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}
