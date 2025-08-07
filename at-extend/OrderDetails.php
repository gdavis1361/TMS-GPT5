<?php 

/**
 *  Order Details
 *
 * @author Steve Keylon
 */

class OrderDetails extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_details';
	
	public function create(	$nOrderId,
							$nDetailType,
							$sDetailValue,
							$nCreatedById ) {

        $key = __CLASS__ . '::' . __METHOD__;
		// Validate Data
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nDetailType) ) {
			add_error('Detail Type: ' . $nDetailType, $key);
			return FALSE;
		}
		if ( !is_string($sDetailValue) ) {
			add_error('Detail Value: ' . $sDetailValue, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return FALSE;
		}
		
		// Insert/Save
		$this->set_order_id($nOrderId);
		$this->set_detail_type($nDetailType);
		$this->set_detail_value($sDetailValue);
		
		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}
		
		$this->set_detail_index( $this->count_details($nOrderId) + 1 );
		
		$this->save();
		// Report
		return true;
	}
	
	public function count_details($nOrderId) {
		$this->where('order_id', '=', $nOrderId);
		return count($this->list()->rows);
	}
}

?>
