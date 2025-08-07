<?php 
/**
 * Customer to Bill To
 *
 * @author Steve Keylon
 */

class CustomertoBillTo extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'customer_to_bill_to';
	
	/**
	 *
	 * @param int $nCustomerId
	 * @param int $nAccountingId
	 * @param int $nCreatedById
	 * @param int $billToLocationId
	 * @return type
	 */
	public function create($nCustomerId, $nAccountingId, $nCreatedById, $billToLocationId = 0) {
		// Validate Data
		if ( !is_numeric($nAccountingId) ) return FALSE;
		if ( !is_numeric($nCustomerId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_accounting_id($nAccountingId);
		$this->set_customer_id($nCustomerId);
		$this->set_created_by_id($nCreatedById); 
		$this->set('bill_to_location_id', $billToLocationId);
		$this->set_created_at(time()); 
		$this->save();
		
		// Report
		return;
	}
}