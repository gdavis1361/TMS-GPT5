<?php

/**
 * Pre Order Details
 *
 * @author Steve Keylon
 */

class PreOrderStopDetails extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_stop_details';

	public function create(	$nPreOrderId,
                                $nStopIndex,
                                $nDetailIndex,
                                $nDetailType,
                                $sDetailValue,
                                $nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('PreOrder Id: ' . $nPreOrderId, $key);
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
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By: ' . $nCreatedById, $key);
			return FALSE;
		}

		// Insert/Save
		$this->set_pre_order_id($nPreOrderId);
		$this->set_stop_index($nStopIndex);
		$this->set_Detail_index($nDetailIndex);
		$this->set_Detail_type($nDetailType);
		$this->set_Detail_value($sDetailValue);

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

	public function count_Details($nPreOrderId, $nStopIndex) {
		$this->where('pre_order_id', '=', $nPreOrderId);
                $this->where('stop_index', '=', $nStopIndex);
		return $this->list()->selected_rows;
	}

	public function get_name(){
		$nId = $this->get_detail_type();
		if ( empty($nId) ) return '';
		$o = new ToolsDetailTypes();
		$o->load($nId);
		return $o->get_detail_type_name();
	}
}

?>