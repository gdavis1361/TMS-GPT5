<?php 

/**
 * Pre Order Details
 *
 * @author Steve Keylon
 */

class PreOrderDetails extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_details';
	
	public function create(	$nPreOrderId,
							$nDetailType,
							$sDetailValue,
							$nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('PreOrder Id: ' . $nPreOrderId, $key);
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
			add_error('Created By: ' . $nCreatedById, $key);
			return FALSE;
		}
		
		// Insert/Save


		$this->set_pre_order_id($nPreOrderId);
		$this->set_detail_type($nDetailType);
		$this->set_detail_value($sDetailValue);

		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at('getdate()');
		}

		$this->set_detail_index( $this->count_details($nPreOrderId) + 1 );
		
		$this->save();
		
		// Report
		return true;
	}
	
	public function count_details($nPreOrderId) {
		$this->where('pre_order_id', '=', $nPreOrderId);
		return $this->list()->selected_rows;
	}
}

?>