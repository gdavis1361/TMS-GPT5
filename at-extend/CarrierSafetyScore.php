<?php 
/**
 * Carrier Safety Score
 *
 * @author Steve Keylon
 */
 
class CarrierSafetyScore extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_safety_score';

	public function create(	$nCarrierId, $nScoreTypeId, $nScoreValue, $nScoreIndex, $sEffectiveDate, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_numeric($nScoreTypeId) ) return FALSE;
		if ( !is_numeric($nScoreValue) ) return FALSE;
		if ( !is_numeric($nScoreIndex) ) return FALSE;
		if ( !is_string($sEffectiveDate) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_carrier_id($nCarrierId);
		$this->set_safety_score_type_id($nScoreTypeId);
		$this->set_score_value($nScoreValue);
		$this->set_score_index($nScoreIndex);
		$this->set_effective_date($sEffectiveDate);
		$this->set_active(1);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>