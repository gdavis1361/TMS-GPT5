<?php

/**
 *  Order Goods
 *
 * @author Steve Keylon
 */

class OrderGoods extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_goods';

	public function create(	$params ) {
		
		$nOrderId = request('order_id', null, $params);
		$nWeight = request('weight', null, $params);
		$sDescription = request('desc', null, $params);
		
		$nCreatedById = request('created_by_id', get_user_id(), $params);
		
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nWeight) ) {
			add_error('Order Weight: ' . $nWeight, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return FALSE;
		}

		// Insert/Save
		$this->set_order_id($nOrderId);
		$this->set('stop_index', 0);
		$this->set('goods_index', 0);
		$this->set('handling_unit', '0');
		$this->set('handling_qty', 0);
		$this->set('piece_type', '0');
		$this->set('goods_desc', $sDescription);
		$this->set('piece_qty', 0);
		$this->set('weight_unit', 'lb');
		$this->set('weight_value', $nWeight);
		
		$this->set_created_by_id($nCreatedById);

		$this->save();
		// Report
		return true;
	}
}

?>