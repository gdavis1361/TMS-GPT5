<?php 

/**
 * Pre Order Charge
 *
 * @author Steve Keylon
 */

class PreOrderCharge extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_charge';
	
	public function create(	$nPreOrderId,
							$nFuelCharge,
							$nLineHaulCharge,
							$nAccessorialCharge,
							$nCreatedById ) {
		// Validate Data

		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('Pre Order Id: '. $nPreOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nFuelCharge) ) {
			add_error('Fuel: '. $nFuelCharge, $key);
			return FALSE;
		}
		if ( !is_numeric($nLineHaulCharge) ) {
			add_error('LineHaul: '. $nLineHaulCharge, $key);
			return FALSE;
		}
		if ( !is_numeric($nAccessorialCharge) ) {
			add_error('Accessorial: '. $nAccessorialCharge, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By: '. $nCreatedById, $key);
			return FALSE;
		}
		
		
		// Insert/Save
		$this->set_pre_order_id($nPreOrderId);
		//$this->set_total_charge($nTotal);
		$this->set_fuel_charge($nFuelCharge);
		$this->set_linehaul_charge($nLineHaulCharge);
		$this->set_accessorial_charge($nAccessorialCharge);

		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at('getdate()');
		}
		
		$this->update_totals();
		$this->save();
		// Report
		return true;
	}
	
	
	/**
	 * Update Totals
	 * 
	 * This does not update the database, only the object. And also must be called on
	 * an object with loaded data. 
	 *
	 */
	private function update_totals() {
		$nFuelCharge = $this->get_fuel_charge();
		$nLineHaulCharge = $this->get_linehaul_charge();
		$nAccessorialCharge = $this->get_accessorial_charge();
		
		$nTotalCharge = $nFuelCharge + $nLineHaulCharge + $nAccessorialCharge;
		
		$this->set_total_charge($nTotalCharge);
	}
}

?>