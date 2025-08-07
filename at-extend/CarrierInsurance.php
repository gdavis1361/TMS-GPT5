<?php 
/**
 * Carrier Insurance
 *
 * @author Steve Keylon
 */
 
class CarrierInsurance extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_insurance';

	public function create(	$aVars ) {
		// Validate Data
		$aRequiredKeys = array('carrier_id', 'insurance_type_id', 'policy_number', 'effective_date', 'insurance_agency_id');
		$aOptionalKeys = array('insurance_value', 'insurance_provider_id');
		
		$errors = false;
		foreach ($aRequiredKeys as $key) {
			if (!isset($aVars[$key])) {
				$errors = true;
				add_error($key . " must be passed to " . __CLASS__ . "::" . __METHOD__);
			}else{
				$this->set($key, $aVars[$key]);
				unset($aVars[$key]);
			}
		}
		if ($errors) return false;
		
		
		// Save Data
		
		foreach($aOptionalKeys as $key){
			if ( isset($aVars[$key]) ) $this->set($key, $aVars[$key]);
		}
		
		$nCreatedById = get_user_id();
		$created_by = $this->get('created_by_id');
		if ( empty($created_by) ) $this->set('created_by_id', $nCreatedById);
		else{
			$this->set('updated_by_id', $nCreatedById);
			$this->set('updated_at', time());
		}
		
		return $this->save();
		
		// Report
		return ;
	}
}

?>