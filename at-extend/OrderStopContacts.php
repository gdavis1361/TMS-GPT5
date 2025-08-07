<?php

/**
 *  Order Contacts
 *
 * @author Steve Keylon
 */

class OrderStopContacts extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_stop_contacts';

	public function create(	$nOrderId,
							$nStopIndex,
							$nContactId,
							$nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nStopIndex) ) {
			add_error('Stop Index: ' . $nStopIndex, $key);
			return FALSE;
		}
		if ( !is_numeric($nContactId) ) {
			add_error('Contact Id: ' . $nContactId, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By: ' . $nCreatedById, $key);
			return FALSE;
		}

		// Insert/Save
		$this->set_order_id($nOrderId);
		$this->set_stop_index($nStopIndex);
		$this->set_Contact_id($nContactId);

		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}

		$this->save();

		// Report
		return true;
	}
}

?>