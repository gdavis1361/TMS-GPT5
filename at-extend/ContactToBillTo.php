<?php 

class ContactToBillTo extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'contact_to_bill_to';
	
	/**
	 *
	 * @param int $contactId
	 * @param int $locationId
	 */
	public function create($contactId, $locationId) {
		// Clean vars
		$contactId = intval($contactId);
		$locationId = intval($locationId);
		
		// Set vars
		$this->set('contact_id', $contactId);
		$this->set('location_id', $locationId);
		
		// Save record
		$this->save();
	}
}