<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

//get the action
$action = post('action', 'get-states');

//Setup the return array
$returnArray = array(
	"good" => true,
	"errors" => array(),
	"message" => ""
);
$nCarrierId = intval( post( 'carrierId' ) );
//Switch on the action
switch ($action) {
	case 'get-states':
		$contactId = intval(post("contactId"));
		$preferredStates = new CarrierPreferredStates();
		$states = $preferredStates->get_carrier_contact_states($contactId, $nCarrierId);
		$records = array();
		foreach($states->rows as $row) {
			$records[] = $row->get();
		}
		$returnArray['records'] = $records;
		// get the contacts method of contact (contact_methods)
		$oContactMethods = new ContactMethods();
		$res = $oContactMethods->list_by_contact_id( $contactId );
		$returnArray['contact_methods'] = $res;
	break;
	
	case 'save-states':
		//Setup the insert data
		$contactId = intval(post("contactId"));
		$aOrigins = post("origins", array());
		$aDestinations = post("destinations", array());
		$preferredStates = new CarrierPreferredStates();
		$returnArray['errors'] = $preferredStates->set_carrier_contact_states($contactId, $nCarrierId, $aOrigins, $aDestinations);
	break;
	
	case 'update-contact-methods':
		$nContactId = intval( post('contactId') );
		$aExistingMethods = post( 'existing', array() );
		$aCreatedMethods = post( 'created', array() );
		$aMethods = array();
		$aFormattedMethods = array();
		foreach( $aExistingMethods as $sData ){
			if( $sData != "" ){
				$aKeyValue = explode( ',', $sData );
				$aTypeIndex = explode( '-', $aKeyValue[0] );
				$aFormattedMethods[$aTypeIndex[0]][$aTypeIndex[1]] = array( 'method_type' => $aTypeIndex[0],
																		'method_index' => $aTypeIndex[1],
																		'contact_value_1' =>$aKeyValue[1] );
			}
		}
		$aMethods[0] = $aFormattedMethods;
		$aFormattedMethods = array();
		foreach( $aCreatedMethods as $aMethod ){
			if( $aMethod != "" ){
				$aTypeValue = explode( ',', $aMethod );
				$aFormattedMethods[] = array( $aTypeValue[0], $aTypeValue[1] );
			}
		}
		$aMethods[1] = $aFormattedMethods;
		$returnArray['methods'] = ContactMethods::update_all_methods_by_contact_id( $nContactId, $aMethods );
	break;
	
	case 'add-mode':
		$nModeId = intval( post( 'typeId' ) );
		$oCarrierMode = new CarrierUsedModes();
		$nId = $oCarrierMode->create( $nCarrierId, $nModeId, get_user_id() );
		if( $nId === false )
			$returnArray['errors'][] = 'Error creating Carrier Mode Used';
		else
			$returnArray['id'] = $nId;
	break;
	
	case 'add-equipment':
		$nEquipmentId = intval( post( 'typeId' ) );
		$nQuantity = intval( post( 'qty' ) );
		$oCarrierEquip = new CarrierToEquipment();
		if( $oCarrierEquip->create( $nCarrierId, $nEquipmentId, $nQuantity, get_user_id() ) !== true )
			$returnArray['errors'][] = 'Error creating Equipment';
	break;
	
	case 'delete-mode':
		$nModeId = intval( post( 'modeId' ) );
		$nModeTypeId = intval( post( 'typeId' ) );
		$oCarrierMode = new CarrierUsedModes();
		$oCarrierMode->where( 'carrier_used_modes_id', '=', $nModeId );
		if( $oCarrierMode->delete() === false )
			$returnArray['errors'][] = "Error deleting Mode with mode_id = $nModeTypeId";
	break;
	
	case 'delete-equipment':
		$nEquipId = intval( post( 'typeId' ) );
		$oCarrierEquip = new CarrierToEquipment();
		$oCarrierEquip->where( 'carrier_id', '=', $nCarrierId );
		$oCarrierEquip->where( 'jaguar_equipment_id', '=', $nEquipId );
		if( $oCarrierEquip->delete() === false )
			$returnArray['error'][] = "Error deleting Equipment with equipment_id $nEquipId";
	break;
	
	case 'update-equipment':
		$nEquipId = intval( post( 'typeId' ) );
		$nQuantity = intval( post( 'qty' ) );
		$o = new DBModel();
		$o->connect();
		$sQuery = "UPDATE carrier_to_equipment SET 
						quantity = $nQuantity, 
						updated_by_id = ".get_user_id().", 
						updated_at = '".date( 'M d Y h:i A' )."'
					WHERE carrier_id = $nCarrierId 
					AND jaguar_equipment_id = $nEquipId";
		$o->query( $sQuery );
	break;
	
	default:
	break;
}

//Return the data
if(count($returnArray['errors'])) {
	$returnArray['good'] = false;
}
echo json_encode($returnArray);