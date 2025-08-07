<?php

/**
 *  Order Details
 *
 * @author Steve Keylon
 */

class OrderStopDetails extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_stop_details';

	public function create(	$nOrderId,
							$nStopIndex,
							$nDetailIndex,
							$nDetailType,
							$sDetailValue ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nStopIndex) ) {
			add_error('Stop Index: ' . $nStopIndex, $key);
			return FALSE;
		}

		if ( !is_numeric($nDetailIndex) ) {
			add_error('Detail Index: ' . $nDetailIndex, $key);
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

		// Insert/Save
		$this->set_order_id($nOrderId);
		$this->set_stop_index($nStopIndex);
		$this->set_Detail_index($nDetailIndex);
		$this->set_Detail_type($nDetailType);
		$this->set_Detail_value($sDetailValue);




		$this->save();

		// Report
		return true;
	}

	public function count_Details($nOrderId, $nStopIndex) {
		$this->where('order_id', '=', $nOrderId);
                $this->where('stop_index', '=', $nStopIndex);
		return $this->list()->selected_rows;
	}

	public function get_name($nId=FALSE){
		if (!$nId) $nId = $this->get_detail_type();
		if ( empty($nId) ) return '';
		$o = new ToolsDetailTypes();
		$o->load($nId);
		return $o->get_detail_type_name();
	}
}

?>
