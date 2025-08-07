<?php
require_once('../at-includes/engine.php');
require_once('../resources/functions.php');

function throw_error($msg){
	//die('<!DOCTYPE html><html><head><style>body{font-family:\'Trebuchet MS\', Arial;font-size:14px;}</style></head><body><h1 style="margin:0 0 5px 0;color:#f00;padding:0;">THIS SHOULD NEVER HAPPEN</h1><div style="width:600px;"><div style="float:left;margin-right:7px;"><img src="http://www.hongejib.com/hongs_blog/images/cute%20kitten(weee).jpg" width="150"></div><div style="float:left;width:250px;">'.$msg.'</div><div style="clear:both"></div></div></body></html>');
}

$nUserId = get_user_id();

// get $nOrderId works
$nOrderId = request('order_id');

$nLoadId = FALSE; //request('load_id'); // this comes later...

if ( !is_numeric($nOrderId) && empty($nLoadId) ) {throw_error('No Order Id was provided');}

$oOrder = new OrderBase;
$oGeoData  = new GeoData;

$oOrder->load( $nOrderId );

$oCharge = new OrderCharge();
$oCharge->load(array('order_id' => $nOrderId));
$nFuelCharge = $oCharge->get('fuel_charge');
$nLinehaulCharge = $oCharge->get('linehaul_charge');
$nAccessorialCharge = $oCharge->get('accessorial_charge');

// an array of all stops from origin to destination
$aStops = $oOrder->get_stops();

// last stop
$oDestination = array_pop($aStops);

// first stop
$oOrigin = array_shift($aStops);

// if no origin or destination throw error
if ( !is_object($oOrigin) ) {
	throw_error('No Origin was found.');
}elseif( !is_object($oDestination) ){
	throw_error('No Destinations were found.');
}

$nOriginZip  = lookup_zip($oOrigin->location_id);

$nDestinationZip = lookup_zip($oDestination->location_id);
//}

$oOriginGeo = $oGeoData->lookup_zip($nOriginZip);

$oDestinationGeo = $oGeoData->lookup_zip($nDestinationZip);

$aSearch = ( empty($nOriginZip) || !is_numeric($nOriginZip) )  ? array() : $oGeoData->radius_search($nOriginZip, 100);

$aZips = array();
$aZipObj = array();
foreach ($aSearch as $row){
	if (!in_array($row->Zip, $aZips)) {
		$aZips[] = $row->Zip;
		$aZipObj[$row->Zip] = $row;
		$aDistance[$row->Zip] = $row->D;
	}
}


// create the carrier obj
// this is needed for setting the origin city
$oCarrier = new CarrierBase();
$oCarrierBaseEx = new CarrierBaseExtended();

$aCarriers = empty($aZips) ? array() : $oCarrier->find_carriers_by_zip($aZips);
foreach ($aCarriers as $nCID => $carrier){
	foreach($carrier->locations as $nLID => $location){
		$aCarriers[$nCID]->locations[$nLID]->Distance = round($aDistance[$location->Zip]);
	}
}



/*
 * Lookup Zip using LocationBase table
 * @param $nLocId int Location Id
 * @return Zipcode 
 */
function lookup_zip($nLocId) {
    $oLocationBase = new LocationBase();
    $oLocationBase->where('location_id', '=', $nLocId);
    $aLocationBase = $oLocationBase->list();
    foreach( $aLocationBase->rows as $Location ) {    
        $a = $Location->zip;
        return $a;
    }
}
?>