<?php 

/**
 * Pre Order Charge
 *
 * @author Steve Keylon
 */

class OrderCharge extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_charge';
	
	public function create(	$nOrderId,
							$nFuelCharge,
							$nLineHaulCharge,
							$nAccessorialCharge,
							$nFuelCost,
							$nLineHaulCost,
							$nAccessorialCost,
							$nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nOrderId) ) {
			add_error('Order id: '. $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nFuelCharge) ) {
			add_error('Fuel Charge: '. $nFuelCharge, $key);
			return FALSE;
		}
		if ( !is_numeric($nLineHaulCharge) ) {
			add_error('LineHaul: '. $nLineHaulCharge, $key);
			return FALSE;
		}
		if ( !is_numeric($nAccessorialCharge) ) {
			add_error('Accessorial Charge: '. $nAccessorialCharge, $key);
			return FALSE;
		}
		if ( !is_numeric($nFuelCost) ) {
			add_error('Fuel Cost: '. $nFuelCost, $key);
			return FALSE;
		}
		if ( !is_numeric($nLineHaulCost) ) {
			add_error('Linehaul Cost: '. $nLineHaulCost, $key);
			return FALSE;
		}
		if ( !is_numeric($nAccessorialCost) ) {
			add_error('Accessorial Cost: '. $nAccessorialCost, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: '. $nCreatedById, $key);
			return FALSE;
		}
		
		// Insert/Save
		$this->set_order_id($nOrderId);

		$this->set_fuel_charge($nFuelCharge);
		$this->set_linehaul_charge($nLineHaulCharge);
		$this->set_accessorial_charge($nAccessorialCharge);
		
		$this->set_fuel_cost($nFuelCost);
		$this->set_linehaul_cost($nLineHaulCost);
		$this->set_accessorial_cost($nAccessorialCost);
		
		// Fill in charge/cost totals, profit, and profit_pct 
		$this->update_totals();
		
		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}
		
		$this->save();
		// Report
		return true;
	}
	
	public function set_costs($nFuelCost, $nLinehaulCost, $nAccessorialCost){
		$this->set('fuel_cost', $nFuelCost);
		$this->set('linehaul_cost', $nLinehaulCost);
		$this->set('accessorial_cost', $nAccessorialCost);
		// Fill in charge/cost totals, profit, and profit_pct 
		$this->update_totals();
	}
	
	public function save(){
		$this->update_totals();
		parent::save();
		
	}
	
	
	/**
	 * Update Totals
	 * 
	 * This does not update the database, only the object. And also must be called on
	 * an object with loaded data. 
	 *
	 */
	private function update_totals() {
		$nFuelCost = $this->get_fuel_cost();
		$nLineHaulCost = $this->get_linehaul_cost();
		$nAccessorialCost = $this->get_accessorial_cost();
		
		$nFuelCharge = $this->get_fuel_charge();
		$nLineHaulCharge = $this->get_linehaul_charge();
		$nAccessorialCharge = $this->get_accessorial_charge();
		
		$nTotalCost = $nFuelCost + $nLineHaulCost + $nAccessorialCost;
		$nTotalCharge = $nFuelCharge + $nLineHaulCharge + $nAccessorialCharge;
		
		$nTotalProfit = $nTotalCharge - $nTotalCost;
        
		if ($nTotalCharge == 0) {
            $nTotalProfitPct = 0;
        }
		else {
            $nTotalProfitPct = round( ($nTotalProfit / $nTotalCharge), 4);
        }
		$this->set_total_charge($nTotalCharge);
		$this->set_total_cost($nTotalCost);
		$this->set_total_profit($nTotalProfit);
		$this->set_total_profit_pct($nTotalProfitPct);
    }
	
    public function get_total_charge($nId) {
        if (!$nId) return;
        $this->load($nId);
        $this->get('total_charge');
        return true;
    }
}

?>
