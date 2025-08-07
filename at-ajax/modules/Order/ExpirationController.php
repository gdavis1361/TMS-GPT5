<?php

class Order_ExpirationController extends AjaxController {

	public function getAction() {
		$o = new PreOrderBase();
		$nOrderId = request('pre_order_id');
		$o->load( $nOrderId );
		
		//pre($o->get());
		
		$records = new stdClass();
		$records->createdAt = date('m/d/Y', strtotime($o->get('created_at')));
		$records->expiration = date('m/d/Y', strtotime($o->get('expiration_date')));

		//$this->setParam('order_id', $nOrderId);
		$this->setParam('record', $records);
	}
	
}