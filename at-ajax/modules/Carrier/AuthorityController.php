<?php

class Carrier_AuthorityController extends AjaxController {
	
	public function saveAction() {
		
	}
	
	public function loadAction() {
		$carrierId = intval(getParam('carrier_id', 0));
		$query = "SELECT common_authority, contract_authority, broker_authority FROM carrier_base_extended WHERE carrier_id = $carrierId";
		$row = LP_Db::fetchRow($query);
		if ($row) {
			$this->setParam('record', $row);
		}
		else {
			$this->addError('No carrier record');
		}
	}
	
}