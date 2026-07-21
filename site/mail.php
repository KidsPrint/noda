<?php
/* ============================================================
   NODA · приём заявок с сайта.
   Форма отправляет заявку сюда (на ваш же домен), а скрипт
   уже с сервера шлёт письмо на почту. Плюс такого канала:
   он на том же домене, что и сайт, — блокировщики рекламы и
   провайдеры его не режут, в отличие от сторонних сервисов.

   Отправляет ТОЛЬКО на зашитый ниже адрес — использовать
   скрипт как спам-рассыльщик нельзя.
   ============================================================ */

/* ---- настройки ---- */
$TO   = 'noda_development@mail.ru';          // куда приходят заявки
$FROM = 'noreply@noda-development.ru';        // отправитель (адрес на вашем домене!)
$ALLOW_HOST = 'noda-development.ru';          // с какого домена принимаем

header('Content-Type: application/json; charset=utf-8');

/* только POST */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'error' => 'method']);
  exit;
}

/* мягкая защита: если браузер прислал Origin/Referer — он должен быть с нашего домена */
$src = '';
if (!empty($_SERVER['HTTP_ORIGIN']))       $src = $_SERVER['HTTP_ORIGIN'];
elseif (!empty($_SERVER['HTTP_REFERER']))  $src = $_SERVER['HTTP_REFERER'];
if ($src !== '' && strpos($src, $ALLOW_HOST) === false && strpos($src, 'localhost') === false) {
  http_response_code(403);
  echo json_encode(['success' => false, 'error' => 'origin']);
  exit;
}

/* тело запроса: JSON или обычная форма */
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) { $data = $_POST; }

$message = isset($data['message']) ? trim((string)$data['message']) : '';
$subject = isset($data['_subject']) ? trim((string)$data['_subject']) : 'Заявка с сайта NODA';

if ($message === '' || mb_strlen($message) > 5000) {
  http_response_code(400);
  echo json_encode(['success' => false, 'error' => 'empty']);
  exit;
}

/* защита от инъекции заголовков: всё пользовательское уходит только в тело письма,
   в тему пускаем без переносов строк */
$subject = str_replace(["\r", "\n"], ' ', $subject);
$subjectEnc = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$headers   = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'Content-Transfer-Encoding: 8bit';
$headers[] = 'From: NODA <' . $FROM . '>';

$ok = @mail($TO, $subjectEnc, $message, implode("\r\n", $headers));

if ($ok) {
  echo json_encode(['success' => true]);
} else {
  http_response_code(500);
  echo json_encode(['success' => false, 'error' => 'mail']);
}
