<?php 
/**
 * Location to Carriers
 *
 * @author Steve Keylon
 */
 
class LocationToModes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'location_to_modes';

	public function create(	$aVars ) {
		
		$aRows = array('location_id', 'mode_id');
		$key = __CLASS__ . '::' . __METHOD__;
		
		if ( !isset($aVars['location_id']) || !number($aVars['location_id']) ) {
			add_error('LOCATION ID requires a number', $key);
			return false;
		}
		if ( !isset($aVars['mode_id']) || !number($aVars['mode_id']) ) {
			add_error('MODE ID requires a number', $key);
			return false;
		}
		
		foreach($aVars as $k => $v){
			if ( in_array($k, $aRows) ) {
				$this->set($k, $v);
			}
		}
		
		$this->save();
		
		// Report
		return true;
	}
}

?>