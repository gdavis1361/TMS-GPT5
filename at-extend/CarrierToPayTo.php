<?php 
/**
 * Carrier to Pay To
 *
 * @author Steve Keylon
 */
 
class CarrierToPayTo extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_to_pay_to';

	public function create($nCarrierId, $nPayToId, $nCreatedById, $payToLocationId = 0) {
		// Validate Data
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_numeric($nPayToId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_carrier_id($nCarrierId);
		$this->set_pay_to_id($nPayToId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		$this->set('pay_to_location_id', $payToLocationId);
		
		$this->save();
		
		// Report
		return ;
	}
}