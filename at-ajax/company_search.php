<?php
/**
 * This file has been replaced with /at-ajax/modules/contact/process/add
 */
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$aReturn = array();

$sQuery = urldecode( request('q') );

/**
 * Search Type:
 * 2 - Customer 
 * 3 - Carrier
 */
$nCarrierType = 3;
$nCustomerType = 2;
$nType = urldecode( request('type') );

$sQuery = trim( preg_replace("/[^0-9A-Za-z]/", " ", $sQuery) );
$aQuery = explode( ' ', $sQuery );

//query and type can't be zero or empty...
if ( empty($aQuery) || empty($nType) ) die("[]"); //empty json array

//Things a user might try to search by:
$aZips = array();
$aStates = array();
$aWords = array();
$aNumbers = array();

//see if any part of the query might be in a word group
foreach($aQuery as $word){
	if ( strlen($word) < 2 ) continue; //smallest word size: 2
	
	if ( strlen($word) == 5 && is_numeric($word) ) $aZips[] = $word;
	if ( strlen($word) == 2 && !is_numeric($word) ) $aStates[] = $word;
	if ( is_numeric($word) ) $aNumbers[] = $word;
	
	
	// Everything goes to Words array. (except words under 2 characters)
	$aWords[] = $word; //mkay
}
	
if ($nType == $nCustomerType) {	
	// Array for sql conditions
	$aWhere = array("1 = 1");
	$aWordColumns = array('customer.customer_name', 'location.location_name_1', 
						'location.location_name_2', 'location.address_1', 
						'location.address_2', 'location.address_3', 'location.location_abbr',
						'info.City', 'can.City');
	$aNumberColumns = array('customer.industry_id');
	$aStateColumns = array('info.State', 'can.State');
	foreach($aWords as $word) {
		foreach ($aWordColumns as $column)
			$aWhere[] = $column . " LIKE '%" . $word . "%'";
	}
	foreach( $aNumbers as $number ){
		foreach ($aNumberColumns as $column) 
			$aWhere[] = $column . " = '" . $number . "'";
	}
	foreach($aStates as $state) {
		foreach($aStateColumns as $column)
			$aWhere[] = $column . " = '" . $state . "'";
	}
	foreach( $aZips as $zip ) 
		$aWhere[] = "location.zip = '" . $zip . "'";
		
	$s = "
		SELECT 
			customer.customer_name as name, customer.customer_id
		FROM 
			tms.dbo.customer_base customer
			LEFT JOIN tms.dbo.customer_to_location c2l ON c2l.customer_id = customer.customer_id
			LEFT JOIN tms.dbo.location_base location ON location.location_id = c2l.location_id
			LEFT JOIN ContractManager.dbo.ZipsPostalCodesUS info ON (info.Zip = location.zip AND info.Seq = location.seq)
			LEFT JOIN ContractManager.dbo.ZipsPostalCodesCAN can ON (can.Zip = location.zip AND can.Seq = location.seq)
		WHERE 
			" . implode("\n\t\t\t OR ", $aWhere) . "
		GROUP BY 
			customer.customer_name, customer.customer_id";
}else if ($nType == $nCarrierType) {
	$aWhere = array("1 = 1");
	
	$aWordColumns = array('carrier.CarrSCAC', 'carrier.CarrName', 'info.City', 'can.City');
	
	$aNumberColumns = array('ex.mc_no');
	$aStateColumns = array('can.State', 'info.State');
	
	foreach($aWords as $word) {
		foreach ($aWordColumns as $column)
			$aWhere[] = $column . " LIKE '%" . $word . "%'";
	}
	foreach( $aNumbers as $number ){
		foreach ($aNumberColumns as $column) 
			$aWhere[] = $column . " = '" . $number . "'";
	}
	foreach($aStates as $state) {
		foreach($aStateColumns as $column)
			$aWhere[] = $column . " = '" . $state . "'";
	}
	foreach( $aZips as $zip ) 
		$aWhere[] = "location.zip = '" . $zip . "'";
		
	
	$s = "
	SELECT
		carrier.CarrName as name, carrier.CarrID as carrier_id
	FROM 
		ContractManager.dbo.CarrierMaster carrier
		LEFT JOIN tms.dbo.carrier_base_extended ex ON ex.carrier_id = carrier.CarrID
		LEFT JOIN tms.dbo.location_to_carriers l2c ON l2c.carrier_id = ex.carrier_id
		LEFT JOIN tms.dbo.location_base location ON location.location_id = l2c.location_id
		LEFT JOIN ContractManager.dbo.ZipsPostalCodesUS info ON (info.Zip = location.zip AND info.Seq = location.seq)
		LEFT JOIN ContractManager.dbo.ZipsPostalCodesCAN can ON (can.Zip = location.zip AND can.Seq = location.seq)
		WHERE 
			" . implode("\n\t\t\t OR ", $aWhere) . "
		GROUP BY 
			carrier.CarrName, carrier.CarrID";
}
$res = $oDB->query($s);
while ($row = $oDB->db->fetch_object($res)) {
	$aReturn[] = $row;
}
die( json_encode($aReturn) );

?>