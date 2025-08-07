<?php

class LocationToCarriers extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'location_to_carriers';

	public function create($locationId, $carrierId) {
		$locationId = intval($locationId);
		$carrierId = intval($carrierId);
		$createdById = get_user_id();
		
		$this->setArray(array(
			'location_id' => $locationId,
			'carrier_id' => $carrierId,
			'created_by_id' => $createdById,
			'created_at' => time()
		));
		
		$success = $this->save();

		return $success;
	}
	
}