<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$from = 'wokes@lamppostgroup.com';
$to = 'wokes@lamppostgroup.com';
$text = 'This is normal text sent from zend mail';
$html = 'This is some <b>HTML</b> sent from zend mail';
$fileName = 'test.pdf';
$pdfFile = __DIR__ . '/../pdf/docs/' . $fileName;
if (is_file($pdfFile)) {
	$mail = new Zend_Mail();
	$mail->setBodyText($text);
	$mail->setBodyHtml($html);
	$mail->setFrom($from, 'Wes Okes');
	$mail->addTo($to, 'Wes Okes');
	$mail->addTo('jlewis@lamppostgroup.com', 'Wes Okes');
	$mail->addTo('skeylon@lamppostgroup.com', 'Wes Okes');
	$mail->setSubject('Test Mail Attachment');
	
	// attach file
	$data = file_get_contents($pdfFile);
	$attachment = $mail->createAttachment($data);
	$attachment->filename = $fileName;
	$mail->send();
}
else {
	die('Looking for ' . $pdfFile);
}
