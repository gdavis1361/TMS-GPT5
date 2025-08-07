<?php 
/**
 * Carrier Preferred Lanes
 *
 * @author Steve Keylon
 */
 
class CarrierPreferredLanes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_preferred_lanes';

	public function create(	$nCarrierId, $nContactId, $nSequence, $nOriginId, $nDestinationId, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_numeric($nContactId) ) return FALSE;
		if ( !is_numeric($nSequence) ) return FALSE;
		if ( !is_numeric($nOriginId) ) return FALSE;
		if ( !is_numeric($nDestinationId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_carrier_id($nCarrierId);
		$this->set_contact_id($nContactId);
		$this->set_sequence($nSequence);
		$this->set_origin_id($nOriginId);
		$this->set_destination_id($nDestinationId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>