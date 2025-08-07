<?php 

/**
 * Order Stops
 *
 * This class defines and handles Stops that are associted with a OrderBase object
 *
  @author Steve Keylon
 */
class OrderStops extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_stops';
	
	// Acceptable stop types (actual values)
	var $m_aStopTypes = array('p', 'd'); // 'p' or 'd' for pickup or drop.
	
	public function create( $nOrderId, 
							$nStopIndex, 
							$nLocationId,
							$sStopType, 
							$sScheduleDate,
							$sApptTime, 
							$nCreatedById,
							$nContactId=0
							) {
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nStopIndex) ) {
			add_error('Stop Index: ' . $nStopIndex, $key);
			return FALSE;
		}
		if ( !is_numeric($nLocationId) ) {
			add_error('Location Id: ' . $nLocationId, $key);
			return FALSE;
		}
		
		$sStopType = strtolower($sStopType);
		if ( !is_string($sStopType) ) {
			add_error('Stop Type: ' . $sStopType . '. Must be a string', $key);
			return FALSE;
		} else if ( strlen($sStopType) !== 1) {
			add_error('Stop Type: ' . $sStopType . '. Must be one character', $key);
			return FALSE;
		} else if ( !in_array($sStopType, $this->m_aStopTypes) ) {
			add_error('Stop Type: ' . $sStopType . 'Not a valid entry', $key);
			return FALSE;
		}
		
		if ( !is_string($sScheduleDate) && !empty($sScheduleDate) ) {
			add_error('Schedule Date: ' . $sScheduleDate, $key);
			return FALSE;
		}
		if ( !is_string($sApptTime) && !empty($sApptTime) ) {
			add_error('Appt Time: ' . $sApptTime, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return FALSE;
		}
		
		// Save Input
		$this->set_order_id($nOrderId);
		$this->set_stop_index($nStopIndex);
		$this->set_location_id($nLocationId);
		$this->set_stop_type($sStopType);
		$this->set_schedule_date( empty($sScheduleDate) ? NULL : $sScheduleDate );
		$this->set('appt_time', empty($sApptTime) ? NULL : $sApptTime );
		$this->set_contact_id(intval($nContactId));
		
		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}
		

		$this->save();
// Report, return the object. 
		return true;
	}
	
	
	public function validate($row){
		$errors = array();
		
		//Make sure we have a location_id or a zip
		if(!$row['location_id'] && !strlen($row['zip'])){
			$errors['location_id'] = "You must choose a location, or a zip code if this is a quote.";
		}
		
		//Make sure there is a date
		if(!isset($row['date']) || !strlen($row['date'])){
			$errors['date'] = "You must specify a date for this stop.";
		}
		
		//Make sure there is a time
		if(!isset($row['time']) || !strlen($row['time'])){
			$errors['time'] = "You must specify a time for this stop.";
		}
		
		return $errors;
	}
	
	public function get_order() {
		$nOrderId = $this->get_order_id();
		$o = new OrderBase();
		if ( empty($nOrderId) ) {
            return array();
        }else{	$o->load($nOrderId);
			return $o;
		}
		return;
	}

    public function get_location_id() {
        $o = new OrderBase();
        $nId = $this->get('order_stops_id');
        if ( empty($nId) ) return 0;
        $o->where('order_stops_id', '=', $nId);
        $a = $o->list()->rows;
        if (isset($a[0])) return $a[0]->get_location_id();

        return 0;
    }

    public function get_contact_id() {
        $o = new OrderStopContacts();
        $nOrderId = $this->get('order_id');
        $nStopIndex = $this->get('stop_index');
        if ( empty($nOrderId) || empty($nStopIndex) ) return 0;
        $o->where('order_id', '=', $nOrderId);
        $o->where('stop_index', '=', $nStopIndex);

        $a = $o->list()->rows;
        if (isset($a[0])) return $a[0]->get_contact_id();

        return 0;
    }

    public function list_details() {
        $nId = $this->get('order_id');
        $nIndex = $this->get('stop_index');
        $o = new OrderStopDetails();
        $o->where('order_id', '=', $nId);
        $o->where('stop_index', '=', $nIndex);

        $a = $o->list()->rows;

        return $a;
    }

    public function list_instructions() {
        $nId = $this->get_order_id();
		$nIndex = $this->get_stop_index();
		if( empty( $nId ) ) return array();

		$aRet = array();
		
		$s = "SELECT instruction.*, type.instruction_type_name FROM order_stop_instructions instruction 
				LEFT JOIN tms.dbo.tools_instruction_types type ON instruction.instruction_type_id = type.instruction_type_id
				WHERE instruction.order_id = '" . $nId . "'
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
		$nOrderId = $this->get_order_id();
		$nStopId = $this->get_order_stops_id();
		$nStopIndex = $this->get_stop_index(); // can be 0, so cannot test with empty()
		if( empty( $nOrderId ) || empty( $nStopId ) ) return false;
		$nUserId = get_user_id();
		$aInstructions = reindex_by_array_element( $aInstructions, 'stop_instruction_id' );
		$oStopInstructions = new OrderStopInstructions();
		$oStopInstructions->where( 'order_id', '=', $nOrderId );
		$oStopInstructions->where( 'stop_index', '=', $nStopIndex );
		if( count( $aInstructions ) == 0 ){
			// this stop has no sent instructions. delete all in db and return
			$oStopInstructions->delete();
			return true;
		}
		$aA = $oStopInstructions->list()->rows;
		$nInstructionIndex = 1;
		foreach( $aA as $a ){
			$nStopInstId = $a->get_order_stop_instruction_id();
			$oStopInstruction = new OrderStopInstructions();
			$oStopInstruction->load( $nStopInstId );
			if( array_key_exists( $nStopInstId, $aInstructions ) ){ // update stored with sent
				$oStopInstruction->create( $nOrderId, $nStopIndex, $nInstructionIndex,
											$aInstructions[$nStopInstId]['id'], 
											$aInstructions[$nStopInstId]['value'],
											$nUserId );
				unset( $aInstructions[$nStopInstId] );
				$nInstructionIndex++;
			}else // delete stored
				$oStopInstruction->delete();
    	}
    	foreach( $aInstructions as $aInstruction ){ // create new stop instruction
    		$oStopInstruction = new OrderStopInstructions();
    		$oStopInstruction->create( $nOrderId, $nStopIndex, $nInstructionIndex,
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
		$nOrderId = $this->get_order_id();
		$nStopIndex = $this->get_stop_index(); // can be 0, so cannot test with empty()
		if( empty( $nOrderId ) ) return false;
		$aDetails = reindex_by_array_element( $aDetails, 'stop_detail_id' );
		$oStopDetails = new OrderStopDetails();
		$oStopDetails->where( 'order_id', '=', $nOrderId );
		$oStopDetails->where( 'stop_index', '=', $nStopIndex );
		if( count( $aDetails ) == 0 ){ // this stop has no sent details, delete all in db and return
			$oStopDetails->delete();
			return true;
		}
		$aA = $oStopDetails->list()->rows;
		$nDetailIndex = 1;
		foreach( $aA as $a ){
			$nStopDetailId = $a->get_order_stop_details_id();
			$oStopDetail = new OrderStopDetails();
			$oStopDetail->load( $nStopDetailId );
			if( array_key_exists( $nStopDetailId, $aDetails ) ){ // update stored with sent
				$oStopDetail->create( $nOrderId, $nStopIndex, $nDetailIndex, 
										$aDetails[$nStopDetailId]['id'], $aDetails[$nStopDetailId]['value'] );
				
				unset( $aDetails[$nStopDetailId] );
				$nDetailIndex++;
			}else // delete stored
				$oStopDetail->delete();
		}
		foreach( $aDetails as $aDetail ){
			$oStopDetail = new OrderStopDetails();
			$oStopDetail->create( $nOrderId, $nStopIndex, $nDetailIndex, $aDetail['id'], $aDetail['value'] );
			$nDetailIndex++;
		}
		return true;
    }
	 * 
	 */
    public function update_details($details){
		$orderId = $this->get_order_id();
		$stopIndex = $this->get_stop_index();
		if(!$orderId){
			return false;
		}
		
		$currentDetails = $this->list_details();
		$currentDetailIds = array();
		foreach ($currentDetails as $currentDetail){
			$currentDetailIds[] = $currentDetail->get('order_stop_details_id');
		}
		
		//Loop Through the details
		$detailIds = array();
		for($i = 0; $i < count($details); $i++){
			$detail = $details[$i];
			$detailIndex = $i;
			$orderStopDetails = new OrderStopDetails();
			$orderStopDetails->load($detail['detail_id']);
			
			//if there is no detail_id create this detail
			if(!$orderStopDetails->get('order_stop_details_id')){
				$orderStopDetails->create(
					$orderId,
					$stopIndex,
					$detailIndex,
					$detail['detail_type_id'],
					$detail['detail_value']
				);
			}
			else{
				$orderStopDetails->setArray(array(
					"order_id" => $orderId,
					"stop_index" => $stopIndex,
					"detail_index" => $detailIndex,
					"detail_type" => $detail['detail_type_id'],
					"detail_value" => $detail['detail_value'],
				));
				$orderStopDetails->save();
			}
			
			//save the detail id
			$detailIds[] = $orderStopDetails->get('order_stop_details_id');
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
    	$nOrderId = $this->get_order_id();
    	$nStopIndex = $this->get_stop_index();
    	if( empty( $nOrderId ) ) return false;
    	$nUserId = get_user_id();
    	
    	$oStopContacts = new OrderStopContacts();
    	$oStopContacts->where( 'order_id', '=', $nOrderId );
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
	    		$oStopContact = new OrderStopContacts();
	    		$oStopContact->where( 'order_id', '=', $nOrderId );
	    		$oStopContact->where( 'contact_id', '=', $a->get_contact_id() );
	    		$oStopContact->delete();
    		}
    	}
    	foreach( $aContacts as $nContact ){
    		$oStopContact = new OrderStopContacts();
    		$oStopContact->create( $nOrderId, $nStopIndex, $nContact, $nUserId );
    	}
    	return true;
    }
    
	/**
	 * override the parent delete function to also delete all related db data
	 */
	public function delete( $aKeys = FALSE, $sTable = FALSE ){
		$nOrderStopId = $this->get_order_stops_id();
		$nOrderId = $this->get_order_id();
		$nStopIndex = $this->get_stop_index();
		if( empty( $nOrderStopId ) || empty( $nOrderId ) ) return false;
		// delete from order_stop_contacts
		$o = new OrderStopContacts();
		$o->where( 'order_id', '=', $nOrderId );
		$o->where( 'stop_index', '=', $nStopIndex );
		$o->delete();
		// delete from order_stop_details
		$o = new OrderStopDetails();
		$o->where( 'order_id', '=', $nOrderId );
		$o->where( 'stop_index', '=', $nStopIndex );
		$o->delete();
		// delete from order_stop_instructions
		$o = new OrderStopInstructions();
		$o->where( 'order_id', '=', $nOrderId );
		$o->where( 'stop_index', '=', $nStopIndex );
		$o->delete();
		// delete self
		$this->where( 'order_stops_id', '=', $nOrderStopId );
		return( parent::delete( $aKeys, $sTable ) );
	}
}
?>