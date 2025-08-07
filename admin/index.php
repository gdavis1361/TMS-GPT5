<?php

require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$sSection = 'admin';
$sPage = request('p', request('page', 'home'));

if ($oSession->session_var('role_id') !== 1) {
	header('Location: /', true, 302);
}

$sAction = request('a', request('action'));
$sDisplay = request('d', request('display'));


//Buffer the output so resources can be added to the header
ob_start();
$sUrlAction = empty($sAction) ? (empty($sDisplay) ? "index" : $sDisplay) : $sAction;
$sUrl = $_SERVER['DOCUMENT_ROOT'] . '/admin/' . strtolower($sPage) . "/index.php";
if (file_exists($sUrl)) {
	require_once($sUrl);
}
else {
	require_once($_SERVER['DOCUMENT_ROOT'] . '/admin/_admin_home.php');
}
$content = ob_get_clean();


//Include the header
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');

//Include the content
echo $content;
