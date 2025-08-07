<?php

class OrderAccessorials extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_accessorials';

	public function create(	$nOrderId,
							$nAccessorialTypeId,
							$nAccessorialQty,
							$nAccessorialPerUnit,
							$nAccessorialCharge,
							$nAccessorialIndex,
							$nBillToId,
							$nCreatedById) {
		// Validate Data

		$key = __CLASS__ . '::' . __METHOD__;
		
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: '. $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nAccessorialTypeId) ) {
			add_error('Accessorial Type Id: '. $nAccessorialTypeId, $key);
			return FALSE;
		}
		if ( !is_numeric($nAccessorialQty) ) {
			add_error('Accessorial Quantity: '. $nAccessorialQty, $key);
			return FALSE;
		}
		if ( !is_numeric($nAccessorialPerUnit) ) {
			add_error('Per Unit price: '. $nAccessorialPerUnit, $key);
			return FALSE;
		}
		
		$nAccessorialCharge = $nAccessorialQty * $nAccessorialPerUnit;
		
		if ( !is_numeric($nAccessorialCharge) ) {
			add_error('Accessorial Charge: '. $nAccessorialCharge, $key);
			return FALSE;
		}
		if ( !is_numeric($nBillToId) ) {
			add_error('Bill To Id: '. $nBillToId, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By: '. $nCreatedById, $key);
			return FALSE;
		}


		// Insert/Save
		$this->set_order_id($nOrderId);
		$this->set_accessorial_index( $nAccessorialIndex );
		$this->set_accessorial_type_id( $nAccessorialTypeId );
		$this->set_accessorial_qty($nAccessorialQty);
		$this->set_accessorial_per_unit($nAccessorialPerUnit);
		$this->set_bill_to($nBillToId);
		$this->set_accessorial_total_charge($nAccessorialCharge);

		if ( !$this->is_loaded() ) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}

		$v = $this->save();

		if ($v) $nId = $this->get_order_accessorial_id();

		// Report
		return $v;
	}
}