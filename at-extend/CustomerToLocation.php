<?php

/**
 * Customer To Location
 *
 * @author Steve Keylon
 */
class CustomerToLocation extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'customer_to_location';

	public function create($aVars) {

		$nCustomerId = isset($aVars['customer_id']) ? $aVars['customer_id'] : '';
		$nLocationId = isset($aVars['location_id']) ? $aVars['location_id'] : '';
		$nCreatedById = isset($aVars['created_by_id']) ? $aVars['created_by_id'] : get_user_id();

		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if (!is_numeric($nLocationId)) {
			add_error('Location ID requires a number', $key);
			return false;
		}
		if (!is_numeric($nCustomerId)) {
			add_error('Customer ID requires a number', $key);
			return false;
		}
		if (!is_numeric($nCreatedById)) {
			add_error('Created By ID requires a number', $key);
			return false;
		}

		// Save Data
		$this->set_location_id($nLocationId);
		$this->set_customer_id($nCustomerId);
		$this->set_created_by_id($nCreatedById);
		$this->set_created_at(time());
		return $this->save();
	}

	function get_locations_by_customer_id($nCustomerId) {
		if (!is_numeric($nCustomerId)) {
			$nCustomerId = $this->get('customer_id');
			if (empty($nCustomerId))
				return false; //second chance.
		}
		$this->connect();
		$s = "
		SELECT loc.*, info.City as city, info.State as state
		FROM 
			tms.dbo.customer_to_location rel
			LEFT JOIN tms.dbo.location_base loc ON loc.location_id = rel.location_id
			LEFT JOIN ContractManager.dbo.ZipsPostalCodesUS info ON info.Zip = loc.zip
		WHERE
			rel.customer_id = " . $this->db->escape($nCustomerId);

		$res = $this->query($s);
		$aReturn = array();

		while ($row = $this->db->fetcch_object($res)) {
			$aReturn[] = $row;
		}

		return $aReturn;
	}

}

?>