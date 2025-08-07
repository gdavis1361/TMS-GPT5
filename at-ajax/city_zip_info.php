<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');

$sCity = request('city');
$sState = request('state');
$sZip = request('zip');
$sType = request('type');


$oGeoData = new GeoData();  //mmkay?

if ($sType == 'zip') {
	// Return a zip
	if (empty($sState) || empty($sCity)) die( json_encode('') );
	$zip = $oGeoData->lookup_zip_by_city($sCity, $sState, true);
	if ($zip !== FALSE) {
		die( json_encode(array('zip' => $zip->Zip, 'city' => $zip->City, 'state' => $zip->State, 'seq' => $zip->Seq)) );
	} else {
		die( json_encode(array('zip' => '', 'city' => '', 'state' => '', 'seq' => '')));
	}
}else if ($sType == 'city'){
	// Return a City/state
	if (empty($sZip)) die (json_encode(''));
	$aData = $oGeoData->lookup_zip($sZip);
	if ( !empty($aData) ){
		die(json_encode(
			array(
				"city" => $aData->City,
				"state" => $aData->State,
				"seq" => $aData->Seq
			)
		)) ;
	}	
}

print( json_encode('') );

?>
