<?php

/**
 * Pre Order Details
 *
 * @author Steve Keylon
 */

class PreOrderEquipmentAllowed extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_equipment_allowed';

	public function create(	$nPreOrderId, $nEquipmentId ) {
		// Validate Data
		if ( !is_numeric($nPreOrderId) ) {
			add_error('PreOrder Id: ' . $nPreOrderId);
			return FALSE;
		}
		if ( !is_numeric($nEquipmentId) ) {
			add_error('Equipment Id: ' . $nEquipmentId);
			return FALSE;
		}

		// Insert/Save
		$this->set_pre_order_id($nPreOrderId);
		$this->set_equipment_id($nEquipmentId);

		$this->save();

		// Report
		return true;
	}
}

?>