<?php 
/**
 * Carrier to Power Unit
 *
 * @author Steve Keylon
 */
 
class CarrierToPowerUnit extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_to_pay_to';

	public function create(	$nCarrierId, $nPowerUnitId, $nQuantity, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_numeric($nPowerUnitId) ) return FALSE;
		if ( !is_numeric($nQuantity) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_carrier_id($nCarrierId);
		$this->set_power_unit_id($nPowerUnitId);
		$this->set_quantity($nQuantity);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>