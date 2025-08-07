<?php
$sPage = 'quotes';

// from set_stops_vars.php
// pasted in here so you know what vars are defines and what is actually happening with this action
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
// end set_stops_vars.php

$preOrder = new PreOrderBase();

// this was the dopPreOrder function
// no need to pass in so many variables to a function
// if these were set in some other way and then the function be called, it would be better
$preOrder->load($nId);
if ($preOrder->create($nCustomerId, $nOrderedById, $nUserId, $nUserId, $vIsQuote, $vIsContractedRate, $vIsPost, $vTeamRequired)) {
	$preOrder->update_charges($nFuelCharge, $nLineHaulCharge, $aAccessorials, $vIsContractedRate);
	$preOrder->update_bill_to($nBillToId);
	$preOrder->add_comments($sOrderComment);
	$preOrder->update_details($aOrderDetails);
	$preOrder->update_equipment($aEquipmentAllowed);
	$preOrder->update_modes($aModesAllowed);
	$preOrder->update_stops($aStops);
}