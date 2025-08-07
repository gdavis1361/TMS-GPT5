<?php 
/**
 * Carrier Stats
 *
 * @author Steve Keylon
 */
 
class CarrierStats extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_stats';

	public function create(	$nCarrierId, $nDateId, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_numeric($nDateId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_carrier_id($nCarrierId);
		$this->set_date_id($nDateId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>