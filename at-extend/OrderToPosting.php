<?php
/**
 * Order Posting
 *
 * @author Steve Keylon
 */

class OrderToPosting extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_to_posting';

	public function create(	$nOrderId, $nPostingId ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nPostingId) ) {
			add_error('Posting Id: ' . $nPostingId, $key);
			return FALSE;
		}
		// Insert/Save
		$this->set_order_id($nOrderId);
		$this->set_posting_id($nPostingId);
		$this->save();
		// Report
		return true;
	}
}

?>