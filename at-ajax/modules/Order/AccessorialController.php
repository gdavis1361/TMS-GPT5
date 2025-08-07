<?php

class Order_AccessorialController extends AjaxController {

	public function getAccessorialListAction() {
		$query = "SELECT * FROM ContractManager.dbo.AccessorialCodes";
		$rows = LP_Db::fetchAll($query);
		$this->setParam('records', $rows);
	}
	
}