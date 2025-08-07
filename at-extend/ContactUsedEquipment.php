<?php

/**
 * Contact Used Equipment
 *
 * @author Steve Keylon
 */
class ContactUsedEquipment extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'contact_used_equipment';

	public function create($nContactId, $nEquipmentId) {
		// Validate Data
		if (!is_numeric($nEquipmentId)) {
			//error 
			return FALSE;
		}
		if (!is_numeric($nContactId)) {
			//error 
			return FALSE;
		}
		
		// Save Data
		$this->set_contact_id($nContactId);
		$this->set_equipment_id($nEquipmentId);

		$this->save();

		// Report
		return;
	}

}