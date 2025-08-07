<?php

/**
 * Pre Order accessorial To Bill To
 *
 * @author Steve Keylon
 */

class PreOrderAccessorialToBillTo extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_accessorial_to_bill_to';

	public function create(	$nPreOrderAccessorialId,
							$nBillToId,
							$nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderAccessorialId) ) {
			add_error('PreOrder Id: ' . $nPreOrderAccessorialId, $key);
			return FALSE;
		}
		if ( !is_numeric($nBillToId) ) {
			add_error('Bill To ID: ' . $nBillToId, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By: ' . $nCreatedById, $key);
			return FALSE;
		}

		// Insert/Save
		$this->set_pre_order_accessorial_id($nPreOrderAccessorialId);
		$this->set_Bill_To_id($nBillToId);

		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			// If created_by_id is empty, we're creating a new record.
			// else, it has been loaded,and we are updating. 
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}

		$this->save();

		// Report
		return true;
	}
}

?>