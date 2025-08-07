<?php 

class CustomerDocumentRequirements extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'customer_document_requirements';

	public function create( $nCustomerId, $nDocumentTypeId, $nQuantity, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nQuantity) ) return FALSE;
		if ( !is_numeric($nDocumentTypeId) ) return FALSE;
		if ( !is_numeric($nCustomerId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_customer_id($nCustomerId);
		$this->set_document_type_id($nDocumentTypeId);
		$this->set_quantity($nQuantity);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time()); 
		$this->save();
		// Report
		return;
	}
}