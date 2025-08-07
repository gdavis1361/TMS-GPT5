<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/init.php');

$resourceManager = LP_ResourceManager::getInstance();
$resourceManager->addJs('/lib/min/f=/resources/js/jquery.functions.js');

// set section for active navigation
$sSection = 'orders';

$sAction = getParam('a', getParam('action', 'index'));
$sDisplay = getParam('d', getParam('display', 'index'));
$nId = intval(getParam('id'));

$path = __DIR__ . '/';
$actionPath = $path . 'actions/';
$viewPath = $path . 'views/';

$actionFile = $actionPath . $sDisplay . '/' . $sAction . '.php';
$viewFile = $viewPath . $sDisplay . '/' . $sAction . '.php';

if (!empty($_POST)) {
	require_once('set_post_variables.php');
}

if (is_file($actionFile)) {
	include $actionFile;
}

require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/header.php');

if (is_file($viewFile)) {
	include $viewFile;
}

require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/footer.php');