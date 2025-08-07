<?php

/**
 * Order Modes
 *
 * @author Steve Keylon
 */

class OrderModesAllowed extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_modes_allowed';

	public function create(	$nOrderId,
							$nModeId,
							$nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nModeId) ) {
			add_error('Mode Type: ' . $nModeId, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By: ' . $nCreatedById, $key);
			return FALSE;
		}

		// Insert/Save
		$this->set_order_id($nOrderId);
		$this->set_Mode_id($nModeId);

		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}

		$this->set_Mode_index( $this->count_modes($nOrderId) + 1 );

		$this->save();

		// Report
		return true;
	}

	public function count_modes($nOrderId) {
		$this->where('order_id', '=', $nOrderId);
		return $this->list()->selected_rows;
	}
}

?>