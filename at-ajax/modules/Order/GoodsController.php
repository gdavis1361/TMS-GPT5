<?php

class Order_GoodsController extends AjaxController {

	public function getAction() {
		$o = new OrderGoods();
		$nOrderId = request('order_id');
		$o->load( array('order_id' => $nOrderId) );
		
		//pre($o->get());
		
		$records = new stdClass();
		$records->weight = $o->get('weight_value');
		$records->desc = $o->get('goods_desc');
		
		//$this->setParam('order_id', $nOrderId);
		$this->setParam('record', $records);
	}
	
}