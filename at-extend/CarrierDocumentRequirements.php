<?php

class CarrierDocumentRequirements extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'carrier_document_requirements';

	public function create($documentTypeId, $quantity) {
		$documentTypeId = intval($documentTypeId);
		$quantity = intval($quantity);
		
		$this->load(array(
			'document_type_id' => $documentTypeId
		));
		
		$this->set('document_type_id', $documentTypeId);
		$this->set('quantity', $quantity);
		
		return $this->save();
	}

}