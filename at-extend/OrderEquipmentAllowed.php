<?php

/**
 * Order Details
 *
 * @author Steve Keylon
 */

class OrderEquipmentAllowed extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_equipment_allowed';

	public function create(	$nOrderId, $nEquipmentId ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nEquipmentId) ) {
			add_error('Equipment Id: ' . $nEquipmentId, $key);
			return FALSE;
		}

		// Insert/Save
		$this->set_order_id($nOrderId);
		$this->set_equipment_id($nEquipmentId);

		$this->save();

		// Report
		return true;
	}
}

?>