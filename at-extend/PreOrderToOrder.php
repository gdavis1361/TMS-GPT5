<?php
/**
 * Pre Order to Order
 *
 * @author Steve Keylon
 */

class PreOrderToOrder extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_to_order';

	public function create(	$nPreOrderId, $nOrderId ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('Pre Order Id: ' . $nPreOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
			return FALSE;
		}
		// Insert/Save
		$this->set_pre_order_id($nPreOrderId);
		$this->set_order_id($nOrderId);
		$this->save();
		// Report
		return true;
	}
    public function get_pre_order_id($nId) {
        if (!$nId) return;
        $this->load($nId);
        $this->get('pre_order_id');
        return true;
    }
    public function get__order_id($nId) {
        if (!$nId) return;
        $this->load($nId);
        $this->get('order_id');
        return true;
    }
}

?>
