<?php
$resourceManager = LP_ResourceManager::getInstance();
$resourceManager->addJs('http://maps.google.com/maps/api/js?sensor=false');

$sPage = 'add';
$vTeamRequired = false;
$vIsContractedRate = false;
$vIsQuote = false;
$nCustomerId = 0;