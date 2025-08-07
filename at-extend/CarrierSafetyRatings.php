<?php 
/**
 * Carrier Safety Ratings
 *
 * @author Steve Keylon
 */
 
class CarrierSafetyRatings extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_safety_ratings';

	public function create(	$sName ) {
		// Validate Data
		if ( !is_string($sName) ) return FALSE;
		
		// Save Data
		$this->set_safety_rating_name($sName);
		
		$this->save();
		
		// Report
		return ;
	}
}

?>