<?php

/**
 * Pre Order To Bill To
 *
 * @author Steve Keylon
 */

class PreOrderToBillTo extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_to_bill_to';

	public function create(	$nPreOrderId,
							$nBillToId ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('PreOrder Id: ' . $nPreOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nBillToId) ) {
			add_error('Bill To ID: ' . $nBillToId, $key);
			return FALSE;
		}

		// Insert/Save
		$this->set_pre_order_id($nPreOrderId);
		$this->set_bill_to_id($nBillToId);

		$this->save();

		// Report
		return true;
	}
}