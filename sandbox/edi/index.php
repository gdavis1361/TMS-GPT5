<?php
require_once('../../at-includes/engine.php');
require_once('../../resources/functions.php');
require_once 'Parser.php';

//Grab the text out of a test edi document
//$ediText = file_get_contents("204.txt");
//$parser = new Edi_Parser();
//$parser->parse($ediText);
$edi = new Edi_204(file_get_contents('sample204.xml'));
$tenders = $edi->getTenders();
pre($tenders[0]->getStops());