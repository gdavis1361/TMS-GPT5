<?php

/**
 * Pre Order Modes
 *
 * @author Steve Keylon
 */

class PreOrderModesAllowed extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_modes_allowed';

	public function create(	$nPreOrderId,
							$nModeId,
							$nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('PreOrder Id: ' . $nPreOrderId, $key);
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
		$this->set_pre_order_id($nPreOrderId);
		$this->set_Mode_id($nModeId);

		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}

		$this->set_Mode_index( $this->count_modes($nPreOrderId) + 1 );

		$this->save();

		// Report
		return true;
	}

	public function count_modes($nPreOrderId) {
		$this->where('pre_order_id', '=', $nPreOrderId);
		return $this->list()->selected_rows;
	}
}

?>