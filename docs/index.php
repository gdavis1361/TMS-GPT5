<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/init.php');

// set section for active navigation
$sSection = 'docs';

$sAction = getParam('a', getParam('action', 'index'));
$sDisplay = getParam('d', getParam('display', 'index'));

$path = __DIR__ . '/';
$actionPath = $path . 'actions/';
$viewPath = $path . 'views/';

$actionFile = $actionPath . $sDisplay . '/' . $sAction . '.php';
$viewFile = $viewPath . $sDisplay . '/' . $sAction . '.php';

if (is_file($actionFile)) {
	include $actionFile;
}

require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');

displayErrors();

if (is_file($viewFile)) {
	include $viewFile;
}

require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/footer.php');