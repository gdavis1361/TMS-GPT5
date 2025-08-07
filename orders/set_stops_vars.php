<?php

$aStopLocations = request('location_id', array());
$aStopTypes = request('stop_type', array());
$aStopIndices = request('stop_index', array());
$aStopDates = request('stop_date', array());
$aStopTimes = request('stop_appt_time', array());
$aStopZip = request('stop_zip', array());
$aStopSeq = request('stop_seq', array());
$aStopID = request('stop_id', array());
$aMovements = request('movement_id', array());
$aLoads = request('load_id', array());
$aStops = array();
foreach ($aStopLocations as $k => $v){
	$aInstructions = array();
	$aDetails = array();
	$aStopContacts = array();
	$aInstructionIDs = request('stop_instruction_id_' . $k, array());
	$aInstructionValues = request('stop_instruction_value_' . $k, array());
	foreach( request('stop_instruction_' . $k, array()) as $key => $val ){
		if( $val != "" ){
			$aInstructions[] = array(
				"id" => $val,
				"stop_instruction_id" => $aInstructionIDs[$key],
				"value" => $aInstructionValues[$key]
			);
		}
	}

	$aDetailIDs = request('stop_detail_id_' . $k, array() );
	$aDetailValues = request('stop_detail_value_' . $k, array());
	foreach( request('stop_detail_' . $k, array()) as $key => $val ){
		if( $val != "" ){
			$aDetails[] = array(
				"id" => $val,
				"stop_detail_id" => $aDetailIDs[$key],
				"value" => $aDetailValues[$key]
			);
		}
	}
	
	$sDate = empty($aStopDates[$k]) ? NULL : date('Y-m-d', strtotime($aStopDates[$k]));
	$sTime = empty($aStopTimes[$k]) ? NULL : date('H:i:s', strtotime($aStopTimes[$k]));
	$aStops[] = array(
		"id" => $aStopID[$k],
		"location_id" => $v,
		"index" => $aStopIndices[$k],
		"date" => $sDate,
		"time" => $sTime,
		"zip" => $aStopZip[$k],
		"seq" => $aStopSeq[$k],
		"type" => $aStopTypes[$k],
		"instructions" => $aInstructions,
		"contacts" => request('stop_contacts_' . $k, array()),
		"details" => $aDetails,
		"movement_id" => (isset($aMovements[$k]) ? $aMovements[$k] : 0),
		"load_id" => (isset($aLoads[$k]) ? $aLoads[$k] : 0)
	);
}

$aTMP = array();

foreach($aStops as $stop){
	$aTMP[$stop['index']] = $stop;
}
$aStops = $aTMP;

?>
