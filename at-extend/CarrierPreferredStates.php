<?php 
 
/**
 * Maps preferred states fields to constants
 * @author jaredtlewis
 *
 */
class CarrierPreferredStates_Fields {
	const Id = 'preferred_states_id';
	const CarrierId = 'carrier_id';
	const ContactId = 'contact_id';
	const State = 'state';
	const Origin = 'origin';
	const CreatedBy = 'created_by_id';
	const CreatedAt = 'created_at';
	const UpdatedBy = 'updated_by_id';
	const UpdatedAt = 'updated_at';
}

/**
 * Carrier Preferred States
 *
 * @author Steve Keylon
 */
class CarrierPreferredStates extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_preferred_states';

	public function create( $nCarrierId, $nContactId, $sState, $nOrigin, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_numeric($nContactId) ) return FALSE;
		if ( !is_string($sState) ) return FALSE;
		if ( $nOrigin != 0 && $nOrigin != 1 ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_carrier_id($nCarrierId);
		$this->set_contact_id($nContactId);
		$this->set_state($sState);
		$this->set_origin($nOrigin);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
	
		$this->save();
		
		// Report
		return true;
	}
	
	/**
	 * Returns a list of states associated with the passed contactId and carrierId
	 * @param number $nContactId
	 * @param number $nCarrierId
	 */
	public function get_carrier_contact_states($nContactId, $nCarrierId){
		$preferredState = new CarrierPreferredStates();
		$preferredState->where(CarrierPreferredStates_Fields::ContactId, "=", $nContactId);
		$preferredState->where(CarrierPreferredStates_Fields::CarrierId, "=", $nCarrierId);
		return $preferredState->list();
	}
	
	/**
	 * Returns only the row data of the states from carrier_preferred_states
	 * @param number $contactId
	 * @param number $carrierId
	 */
	public function getPreferredStates($contactId, $carrierId) {
		$query = "SELECT * FROM carrier_preferred_states WHERE carrier_id = $carrierId AND contact_id = $contactId";
		$rows = LP_Db::fetchAll($query);
		return $rows;
	}
	
	/**
	 * Sets a contacts preferred states
	 * @param integer $nContactId
	 * @param integer $nCarrierId
	 * @param array $aOrigins
	 * @param array $aDestinations
	 */
	public function set_carrier_contact_states($nContactId, $nCarrierId, $aOrigins, $aDestinations){
		//Set up an error array
		$errors = array();
		
		//Delete all existing states for this contact on this carrier
		$preferredState = new CarrierPreferredStates();
		$preferredState->where(CarrierPreferredStates_Fields::ContactId, "=", $nContactId);
		$preferredState->where(CarrierPreferredStates_Fields::CarrierId, "=", $nCarrierId);
		$preferredState->delete();
		
		
		//Insert all the origins
		if(count($aOrigins)){
			foreach ($aOrigins as $origin){
				//Make sure this is not empty
				if(!strlen($origin)){
					continue;
				}
				
				//Insert the state into the db
				$preferredState = new CarrierPreferredStates();
				if($preferredState->create($nCarrierId, $nContactId, $origin, 1, 0) !== true){
					$errors[] = "Origin $origin did not insert properly.";
				}
			}
		}
		
		//Insert all the destinations
		if(count($aDestinations)){
			foreach ($aDestinations as $destination){
				//Make sure this is not empty
				if(!strlen($destination)){
					continue;
				}
				
				//Insert the state into the db
				$preferredState = new CarrierPreferredStates();
				if($preferredState->create($nCarrierId, $nContactId, $destination, 0, 0) !== true){
					$errors[] = "Destination $destination did not insert properly.";
				}
			}
		}
		
		//Return any errors
		return $errors;
	}
}

?>