<?php

class ContactDocumentRequirements extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'contact_document_requirements';

	public function create($contactId, $documentTypeId, $quantity) {
		// Clean vars
		$contactId = intval($contactId);
		$documentTypeId = intval($documentTypeId);
		$quantity = intval($quantity);

		// Set data
		$this->setArray(array(
			'contact_id' => $contactId,
			'document_type_id' => $documentTypeId,
			'quantity' => $quantity
		));
		
		// Save record
		$this->save();
	}

}