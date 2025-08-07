<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');
$resourceManager = LP_ResourceManager::getInstance();
$resourceManager->addCss("/lib/min/f=/contacts/css/contacts.css");