<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond(int $status, array $body): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function config_value(string $key, string $default = ''): string {
    $environment = getenv($key);
    if (is_string($environment) && $environment !== '') return $environment;
    static $fileValues = null;
    if ($fileValues === null) {
        $path = dirname(__DIR__) . '/.env';
        $fileValues = is_readable($path) ? (parse_ini_file($path, false, INI_SCANNER_RAW) ?: []) : [];
    }
    return isset($fileValues[$key]) ? trim((string)$fileValues[$key], " \t\n\r\0\x0B\"'") : $default;
}

$secret = config_value('ALCYANNE_LEADS_WEBHOOK_SECRET');
$allowedOrigin = rtrim(config_value('ALCYANNE_ALLOWED_ORIGIN', 'https://psicoterapia.alcyannegouveiapsi.com.br'), '/');
$webhookUrl = config_value('ALCYANNE_LEADS_WEBHOOK_URL', 'https://webhook.studio4x.com.br/webhook/alcyanne-psicoterapia-leads');
$configured = strlen($secret) >= 32 && filter_var($webhookUrl, FILTER_VALIDATE_URL);

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['status'])) respond(200, ['configured' => $configured]);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['ok' => false, 'message' => 'Método não permitido.']);
if (!$configured) respond(503, ['ok' => false, 'message' => 'Integração temporariamente indisponível.']);

$contentType = strtolower((string)($_SERVER['CONTENT_TYPE'] ?? ''));
if (!str_starts_with($contentType, 'application/json')) respond(415, ['ok' => false, 'message' => 'Envie JSON.']);
$contentLength = (int)($_SERVER['CONTENT_LENGTH'] ?? 0);
if ($contentLength <= 0 || $contentLength > 12000) respond(413, ['ok' => false, 'message' => 'Corpo da requisição inválido.']);

$origin = rtrim((string)($_SERVER['HTTP_ORIGIN'] ?? ''), '/');
if ($origin !== $allowedOrigin) respond(403, ['ok' => false, 'message' => 'Origem não autorizada.']);
if (strcasecmp((string)($_SERVER['HTTP_X_REQUESTED_WITH'] ?? ''), 'XMLHttpRequest') !== 0) respond(403, ['ok' => false, 'message' => 'Requisição não autorizada.']);

$raw = file_get_contents('php://input', false, null, 0, 12001);
if (!is_string($raw) || strlen($raw) > 12000) respond(413, ['ok' => false, 'message' => 'Corpo da requisição inválido.']);
$data = json_decode($raw, true);
if (!is_array($data)) respond(400, ['ok' => false, 'message' => 'JSON inválido.']);
if (trim((string)($data['website'] ?? '')) !== '') respond(400, ['ok' => false, 'message' => 'Não foi possível processar a solicitação.']);

$name = preg_replace('/\s+/u', ' ', trim((string)($data['nome'] ?? ''))) ?? '';
if (mb_strlen($name) < 2 || mb_strlen($name) > 60 || !preg_match("/^[\\p{L}][\\p{L}\\s'’\\-]{1,59}$/u", $name)) respond(422, ['ok' => false, 'message' => 'Informe um primeiro nome válido.']);
$digits = preg_replace('/\D+/', '', (string)($data['whatsapp'] ?? '')) ?? '';
if (str_starts_with($digits, '55') && in_array(strlen($digits), [12, 13], true)) $digits = substr($digits, 2);
if (!in_array(strlen($digits), [10, 11], true) || preg_match('/^(\d)\1+$/', $digits)) respond(422, ['ok' => false, 'message' => 'Informe um WhatsApp brasileiro válido.']);
$ddd = (int)substr($digits, 0, 2);
if ($ddd < 11 || $ddd > 99 || (strlen($digits) === 11 && $digits[2] !== '9')) respond(422, ['ok' => false, 'message' => 'Informe um WhatsApp brasileiro válido.']);
if (($data['consentimento'] ?? false) !== true) respond(422, ['ok' => false, 'message' => 'É necessário aceitar a Política de Privacidade.']);

$allowedCtas = ['header', 'hero', 'como-funciona', 'cta-final', 'flutuante'];
if (!in_array((string)($data['cta_location'] ?? ''), $allowedCtas, true)) respond(422, ['ok' => false, 'message' => 'Origem do contato inválida.']);
$leadId = (string)($data['lead_id'] ?? '');
if (!preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i', $leadId)) respond(422, ['ok' => false, 'message' => 'Identificador inválido.']);
$pageOrigin = parse_url((string)($data['page_url'] ?? ''), PHP_URL_SCHEME) . '://' . parse_url((string)($data['page_url'] ?? ''), PHP_URL_HOST);
if ($pageOrigin !== $allowedOrigin) respond(403, ['ok' => false, 'message' => 'Página de origem inválida.']);

$clientIp = (string)($_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown');
$rateKey = hash_hmac('sha256', $clientIp, $secret);
$rateFile = sys_get_temp_dir() . '/alcyanne_rate_' . $rateKey . '.json';
$now = time();
$attempts = [];
if (is_readable($rateFile)) {
    $saved = json_decode((string)file_get_contents($rateFile), true);
    if (is_array($saved)) $attempts = array_values(array_filter($saved, fn($timestamp) => is_int($timestamp) && $now - $timestamp < 3600));
}
if (count($attempts) >= 10) respond(429, ['ok' => false, 'message' => 'Muitas tentativas. Aguarde alguns minutos.']);
$attempts[] = $now;
file_put_contents($rateFile, json_encode($attempts), LOCK_EX);

$payload = $data;
$payload['nome'] = $name;
$payload['whatsapp'] = '+55' . $digits;
$payload['service'] = 'psicoterapia';
$jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

$curl = curl_init($webhookUrl);
curl_setopt_array($curl, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CONNECTTIMEOUT => 8,
    CURLOPT_TIMEOUT => 18,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'X-Lead-Secret: ' . $secret],
    CURLOPT_POSTFIELDS => $jsonPayload,
]);
$responseBody = curl_exec($curl);
$responseCode = (int)curl_getinfo($curl, CURLINFO_HTTP_CODE);
$curlError = curl_errno($curl);
curl_close($curl);

if ($curlError !== 0 || !is_string($responseBody) || $responseCode < 200 || $responseCode >= 300) respond(503, ['ok' => false, 'message' => 'Não foi possível registrar seus dados neste momento. Tente novamente.']);
$response = json_decode($responseBody, true);
if (!is_array($response) || ($response['ok'] ?? false) !== true) respond(503, ['ok' => false, 'message' => 'Não foi possível registrar seus dados neste momento. Tente novamente.']);
respond(201, ['ok' => true, 'lead_id' => $leadId]);

