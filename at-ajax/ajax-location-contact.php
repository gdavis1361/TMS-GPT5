<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$nLocationId = request('location_id', 0);

if (empty($nLocationId)) die( json_encode(array()) );

$aResults = array();

$oLocationContact = new LocationToContact();

$a = $oLocationContact->contact_info_by_location( $nLocationId );

print( json_encode($a) );

?>
