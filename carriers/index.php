<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/init.php');

$resourceManager = LP_ResourceManager::getInstance();
$resourceManager->addJs('/lib/min/f=/resources/js/jquery.functions.js');
$resourceManager->addJs('/lib/min/f=/resources/js/extensible/extensible-all.js');
$resourceManager->addCss('/lib/min/f=/resources/js/extensible/resources/css/extensible-all.css');

// set section for active navigation
$sSection = 'contacts';

$sAction = getParam('a', getParam('action', 'index'));
$sDisplay = getParam('d', getParam('display', 'index'));
$nId = request('id');

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