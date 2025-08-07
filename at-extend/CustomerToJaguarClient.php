<?php 
/**
 * Customer to Jaguar Client
 *
 * @author Steve Keylon
 */

class CustomerToJaguarClient extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'customer_to_jaguar_client';

	public function create( $nCustomerId, $nClientId, $nCreatedById ) {
		// Validate Data
		if (!is_numeric($nClientId) ) return FALSE;
		if ( !is_numeric($nCustomerId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_clientID($nClientId);
		$this->set_customer_id($nCustomerId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time()); 
		$this->save();
		// Report
		return;
	}
}
?>