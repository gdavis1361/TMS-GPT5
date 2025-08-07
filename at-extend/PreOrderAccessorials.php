<?php
/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of PreOrderAccessorials
 *
 * @author skeylon
 */
class PreOrderAccessorials extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_accessorials';

	public function create(	$nPreOrderId,
							$nAccessorialTypeId,
							$nAccessorialQty,
							$nAccessorialPerUnit,
							$nAccessorialCharge,
							$nAccessorialIndex,
							$nBillToId,
							$nCreatedById) {
		// Validate Data

		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('Pre Order Id: '. $nPreOrderId, $key);
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
		$nBillToId = intval($nBillToId);
		
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By: '. $nCreatedById, $key);
			return FALSE;
		}


		// Insert/Save
		$this->set_pre_order_id($nPreOrderId);
		$this->set_accessorial_index( $this->get_new_index()); // NOTE: depricated column
		$this->set_accessorial_type_id( $nAccessorialTypeId );
		$this->set_accessorial_qty($nAccessorialQty);
		$this->set_accessorial_per_unit($nAccessorialPerUnit);
		$this->set_accessorial_total_charge($nAccessorialCharge);
		
		if ( !$this->is_loaded() ) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}

		$this->save();

		$nId = $this->get_pre_order_accessorial_id();

		$oBillTo = new PreOrderAccessorialToBillTo();
		$oBillTo->load( array("pre_order_accessorial_id" => $nId) );
		if ( !$oBillTo->create($nId, $nBillToId, $nCreatedById) ){
			add_error('Accessorial Bill To failed to create: '. $nBillToId, $key);
			return FALSE;
		}
		// Report
		return true;
	}

	public function get_bill_to() {
		$nId = $this->get_pre_order_accessorial_id();
		if (empty($nId )) return false;
		$o = new PreOrderAccessorialToBillTo();
		$o->where('pre_order_accessorial_id', '=', $nId);
		$a = $o->list()->rows;
		if (isset($a[0])) return $a[0]->get_bill_to_id();
		return false;
	}
	
	/**
	 * override the parent delete function to also delete all related db data
	 */
	public function delete( $aKeys = FALSE, $sTable = FALSE ){
		$nPreOrderAccId = $this->get_pre_order_accessorial_id();
		if( empty( $nPreOrderAccId ) ) return false;
		// delete from pre_order_accessorial_to_bill_to
		$o = new PreOrderAccessorialToBillTo();
		$o->where( 'pre_order_accessorial_id', '=', $nPreOrderAccId );
		$o->delete();
		// delete self
		$this->where( 'order_stops_id', '=', $nOrderStopId );
		return( parent::delete( $aKeys, $sTable ) );
	}
	
	public function getBillToId() {
		$accessorialId = $this->get('pre_order_accessorial_id');
		$query = "SELECT bill_to_id FROM pre_order_accessorial_to_bill_to WHERE pre_order_accessorial_id = $accessorialId";
		$row = LP_Db::fetchRow($query);
		$billToId = 0;
		if ($row) {
			$billToId = $row['bill_to_id'];
		}
		return $billToId;
	}
}