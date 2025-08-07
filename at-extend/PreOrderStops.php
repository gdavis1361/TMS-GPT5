<?php 

/**
 * Pre Order Stops
 *
 * This class defines and handles Stops that are associted with a PreOrderBase object
 *
  @author Steve Keylon
 */
class PreOrderStops extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_stops';
	
	// Acceptable stop types (actual values)
	var $m_aStopTypes = array('p', 'd'); // 'p' or 'd' for pickup or drop.
	
	public function create( $nPreOrderId, 
							$nStopIndex, 
							$sStopType, 
							$sScheduleDate,
							$sApptTime, 
							$nCreatedById, // Employee
							$sZipCode,
							$locationId,
							$contactId) {


		// Validate input
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('PreOrder Id: ' . $nPreOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nStopIndex) ) {
			add_error('Stop Index: ' . $nStopIndex, $key);
			return FALSE;
		}
		$sStopType = strtolower($sStopType);
		if ( !is_string($sStopType) ) {
			add_error('Stop Type Must be String: ' . $sStopType, $key);
			return FALSE;
		}
		else if ( !in_array($sStopType, $this->m_aStopTypes) ) {
			add_error('Stop Type must either be "p" or "d": ' . $sStopType, $key);
			return FALSE;
		}
		
		if ( !is_string($sScheduleDate) && !empty($sScheduleDate) ) {
			add_error('ScheduleDate: ' . $sScheduleDate, $key);
			return FALSE;
		}
		if ( !empty($sApptTime) && !is_string($sApptTime) ) {
			add_error('Appt Time: ' . $sApptTime, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By: ' . $nCreatedById, $key);
			return FALSE;
		}
		if ( !is_string($sZipCode) ) {
			add_error('Zip Code: ' . $sZipCode, $key);
			return FALSE;
		}
		
		$locationId = intval($locationId);
		$contactId = intval($contactId);
		
		$sZipSequence = 0;
		
		// Save Input
		
		$this->set_pre_order_id($nPreOrderId);
		$this->set_stop_index($nStopIndex);
		$this->set_stop_type($sStopType);
		$this->set('schedule_date' , empty($sScheduleDate) ? NULL : $sScheduleDate );
		$this->set_appt_time(empty($sApptTime) ? NULL : $sApptTime);
		$this->set_created_by_id($nCreatedById); 
		$this->set_zip_code($sZipCode);
		$this->set_zip_sequence($sZipSequence);
		
		$this->set('location_id', $locationId);
		$this->set('contact_id', $contactId);

		$this->save();
		
		// Report, return the object. 
		return true;
	}
	
	public function get_pre_order() {
		$nPreOrderId = $this->get_pre_order_id();
		$o = new PreOrderBase();
		if ( !empty($nPreOrderId) ) {
			$o->load($nPreOrderId);
			return $o;
		}
		return;
	}

	public function get_location_id() {
		$o = new PreOrderStopToLocation();
		$nId = $this->get_pre_order_stops_id();
		if ( empty($nId) ) return 0;
		$o->where('pre_order_stops_id', '=', $nId);
		$a = $o->list()->rows;
		if (isset($a[0])) return $a[0]->get_location_id();

		return 0;
	}

	public function get_contact_id() {
		$o = new PreOrderStopContacts();
		$nPreOrderId = $this->get_pre_order_id();
		$nStopIndex = $this->get('stop_index');
		if ( empty($nPreOrderId) || empty($nStopIndex) ) return 0;
		$o->where('pre_order_id', '=', $nPreOrderId);
		$o->where('stop_index', '=', $nStopIndex);

		$a = $o->list()->rows;
		if (isset($a[0])) return $a[0]->get_contact_id();

		return 0;
	}
    public function get_zip_sequence() {
        $nPreOrderId = $this->get_pre_order_id();
        $nStopIndex = $this->get('stop_index');
        if ( empty($nPreOrderId) || empty($nStopIndex) ) return 0;
        $this->where('pre_order_id', '=', $nPreOrderId);
        $this->where('stop_index', '=', $nStopIndex);

        $a = $this->list()->rows;
        if (isset($a[0])) return $a[0]->get_zip_sequence();

        return 0;
    }

	public function list_details() {
		$nId = $this->get_pre_order_id();
		$nIndex = $this->get_stop_index();
		$o = new PreOrderStopDetails();
		$o->where('pre_order_id', '=', $nId);
		$o->where('stop_index', '=', $nIndex);

		$a = $o->list()->rows;

		return $a;
	}

	public function list_instructions() {
		$nId = $this->get_pre_order_id();
		$nIndex = $this->get_stop_index();
		if( empty( $nId ) ) return array();

		$aRet = array();
		
		$s = "SELECT instruction.*, type.instruction_type_name FROM pre_order_stop_instructions instruction 
				LEFT JOIN tms.dbo.tools_instruction_types type ON instruction.instruction_type_id = type.instruction_type_id
				WHERE instruction.pre_order_id = '" . $nId . "'
					AND instruction.stop_index = '" . $nIndex . "'";
		$this->connect();
		$res = $this->query($s);
		while ( $row = $this->db->fetch_object($res) ) {
			$aRet[] = (array)$row;
		}
		return $aRet;
	}
	
	/**
     * create/update/delete this order_stop's instructions
     * @param array $aInstructions an array of instructions for this stop
     *
     * @return bool (true = success, false = failure) false is strict failure, true is not a strict success
     */
    public function update_instructions( $aInstructions ){
		$nPreOrderId = $this->get_pre_order_id();
		$nStopId = $this->get_pre_order_stops_id();
		$nStopIndex = $this->get_stop_index(); // can be 0, so cannot test with empty()
		if( empty( $nPreOrderId ) || empty( $nStopId ) ) return false;
		$nUserId = get_user_id();
		$aInstructions = reindex_by_array_element( $aInstructions, 'stop_instruction_id' );
		$oStopInstructions = new PreOrderStopInstructions();
		$oStopInstructions->where( 'pre_order_id', '=', $nPreOrderId );
		$oStopInstructions->where( 'stop_index', '=', $nStopIndex );
		if( count( $aInstructions ) == 0 ){
			// this stop has no sent instructions. delete all in db and return
			$oStopInstructions->delete();
			return true;
		}
		$aA = $oStopInstructions->list()->rows;
		$nInstructionIndex = 1;
		foreach( $aA as $a ){
			$nStopInstId = $a->get_pre_order_stop_instruction_id();
			$oStopInstruction = new PreOrderStopInstructions();
			$oStopInstruction->load( $nStopInstId );
			if( array_key_exists( $nStopInstId, $aInstructions ) ){ // update stored with sent
				$oStopInstruction->create( $nPreOrderId, $nStopIndex, $nInstructionIndex,
											$aInstructions[$nStopInstId]['id'], 
											$aInstructions[$nStopInstId]['value'],
											$nUserId );
				unset( $aInstructions[$nStopInstId] );
				$nInstructionIndex++;
			}else // delete stored
				$oStopInstruction->delete();
    	}
    	foreach( $aInstructions as $aInstruction ){ // create new stop instruction
    		$oStopInstruction = new PreOrderStopInstructions();
    		$oStopInstruction->create( $nPreOrderId, $nStopIndex, $nInstructionIndex,
    									$aInstruction['id'], $aInstruction['value'], $nUserId );
    		$nInstructionIndex++;
    	}
    	return true;
    }
    
    /**
	 * create/update/delete this order_stop's details
	 * @param array $aDetails an array of details for this stop
	 *
	 * @return bool (true = success, false = failure) false is strict failure, true is not a strict success
	 */
	/*
    public function update_details( $aDetails ){
		$nPreOrderId = $this->get_pre_order_id();
		$nStopIndex = $this->get_stop_index(); // can be 0, so cannot test with empty()
		if( empty( $nPreOrderId ) ) return false;
		$nUserId = get_user_id();
		$aDetails = reindex_by_array_element( $aDetails, 'stop_detail_id' );
		$oStopDetails = new PreOrderStopDetails();
		$oStopDetails->where( 'pre_order_id', '=', $nPreOrderId );
		$oStopDetails->where( 'stop_index', '=', $nStopIndex );
		if( count( $aDetails ) == 0 ){ // this stop has no sent details, delete all in db and return
			$oStopDetails->delete();
			return true;
		}
		$aA = $oStopDetails->list()->rows;
		$nDetailIndex = 1;
		foreach( $aA as $a ){
			$nStopDetailId = $a->get_pre_order_stop_details_id();
			$oStopDetail = new PreOrderStopDetails();
			$oStopDetail->load( $nStopDetailId );
			if( array_key_exists( $nStopDetailId, $aDetails ) ){ // update stored with sent
				$oStopDetail->create( $nPreOrderId, $nStopIndex, $nDetailIndex, 
										$aDetails[$nStopDetailId]['id'], $aDetails[$nStopDetailId]['value'],
										$nUserId );
				
				unset( $aDetails[$nStopDetailId] );
				$nDetailIndex++;
			}else // delete stored
				$oStopDetail->delete();
		}
		foreach( $aDetails as $aDetail ){
			$oStopDetail = new PreOrderStopDetails();
			$oStopDetail->create( $nPreOrderId, $nStopIndex, $nDetailIndex, 
									$aDetail['id'], $aDetail['value'], $nUserId );
			$nDetailIndex++;
		}
		return true;
    }
	 */
	
	 public function update_details($details){
		$preOrderId = $this->get('pre_order_id');
		$stopIndex = $this->get_stop_index();
		if(!$preOrderId){
			return false;
		}
		
		$currentDetails = $this->list_details();
		$currentDetailIds = array();
		foreach ($currentDetails as $currentDetail){
			$currentDetailIds[] = $currentDetail->get('pre_order_stop_details_id');
		}
		$myUserId = get_user_id();
		//Loop Through the details
		$detailIds = array();
		for($i = 0; $i < count($details); $i++){
			$detail = $details[$i];
			$detailIndex = $i;
			$orderStopDetails = new PreOrderStopDetails();
			$orderStopDetails->load($detail['detail_id']);
			
			//if there is no detail_id create this detail
			if(!$orderStopDetails->get('pre_order_stop_details_id')){
				$orderStopDetails->create(
					$preOrderId,
					$stopIndex,
					$detailIndex,
					$detail['detail_type_id'],
					$detail['detail_value'],
					$myUserId
				);
			}
			else{
				$orderStopDetails->setArray(array(
					"pre_order_id" => $preOrderId,
					"stop_index" => $stopIndex,
					"detail_index" => $detailIndex,
					"detail_type" => $detail['detail_type_id'],
					"detail_value" => $detail['detail_value'],
				));
				$orderStopDetails->save();
			}
			
			//save the detail id
			$detailIds[] = $orderStopDetails->get('pre_order_stop_details_id');
		}
		
		//Remove any details that were deleted
		foreach ($currentDetailIds as $currentDetailId){
			if(!in_array($currentDetailId, $detailIds)){
				$deleteDetail = new OrderStopDetails();
				$deleteDetail->load($currentDetailId);
				$deleteDetail->delete();
			}
		}
    }
    
    /**
     *
     */
    public function update_contacts( $aContacts ){
    	$nPreOrderId = $this->get_pre_order_id();
    	$nStopIndex = $this->get_stop_index();
    	if( empty( $nPreOrderId ) ) return false;
    	$nUserId = get_user_id();
    	
    	$oStopContacts = new PreOrderStopContacts();
    	$oStopContacts->where( 'pre_order_id', '=', $nPreOrderId );
    	$oStopContacts->where( 'stop_index', '=', $nStopIndex );
    	if( count( $aContacts ) == 0 ){ // this stop has no sent contacts. delete all in db and return
    		$oStopContacts->delete();
    		return true;
    	}
    	$aA = $oStopContacts->list()->rows;
    	foreach( $aA as $a ){
    		// because order_stop_contacts does not have a single uniqu id, use raw queries for update and delete
    		if( in_array( $a->get_contact_id(), $aContacts ) ){
    			$aContacts = remove_item_by_value( $aContacts, $a->get_contact_id() );
    		}else{ // delete stored
	    		$oStopContact = new PreOrderStopContacts();
	    		$oStopContact->where( 'pre_order_id', '=', $nPreOrderId );
	    		$oStopContact->where( 'contact_id', '=', $a->get_contact_id() );
	    		$oStopContact->delete();
    		}
    	}
    	foreach( $aContacts as $nContact ){
    		$oStopContact = new PreOrderStopContacts();
    		$oStopContact->create( $nPreOrderId, $nStopIndex, $nContact, $nUserId );
    	}
    	return true;
    }
    
	/**
	 * override parent delete function to delete related db data
	 */
	public function delete( $aKeys = FALSE, $sTable = FALSE ){
		$nSId = $this->get_pre_order_stops_id();
		$nPOrderId = $this->get_pre_order_id();
		$nIndex = $this->get_stop_index();
		
		if( !is_numeric( $nSId ) || !is_numeric( $nPOrderId ) || !is_numeric( $nIndex ) ) return false;

		// delete all the stop_details
		$o = new PreOrderStopDetails();
		$o->where( 'pre_order_id', '=', $nPOrderId );
		$o->where( 'stop_index', '=', $nIndex );
		$o->delete();
		// delete all stop_to_locations
		$o = new PreOrderStopToLocation();
		$o->where( 'pre_order_stops_id', '=', $nSId );
		$o->delete();
		// delete all instructions
		$o = new PreOrderStopInstructions();
		$o->where( 'pre_order_id', '=', $nPOrderId );
		$o->where( 'stop_index', '=', $nIndex );
		$o->delete();
		// delete all stop_contacts
		$o = new PreOrderStopContacts();
		$o->where( 'pre_order_id', '=', $nPOrderId );
		$o->where( 'stop_index', '=', $nIndex );
		$o->delete();
		// delete this
		$this->where( 'pre_order_stops_id', '=', $nSId );
		return( parent::delete( $aKeys, $sTable ) );
	}
}


?>
