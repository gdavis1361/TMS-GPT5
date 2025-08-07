<?php

/**
 *  Order Document Requirements
 *
 * @author Steve Keylon
 */

class OrderDocumentRequirements extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_document_requirements';

	public function create(	$nOrderId,
							$nDocumentTypeId,
							$nQuantity,
							$nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nDocumentTypeId) ) {
			add_error('Document Type: ' . $nDocumentTypeId, $key);
			return FALSE;
		}
		if ( !is_numeric($nQuantity) ) {
			add_error('Quantity: ' . $nQuantity, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return FALSE;
		}

		// Insert/Save
		$this->set_order_id($nOrderId);
		$this->set_document_type_id($nDocumentTypeId);
		$this->set_quantity($nQuantity);
		$this->set_created_by_id($nCreatedById);

		$this->save();
		// Report
		return true;
	}
}

?>