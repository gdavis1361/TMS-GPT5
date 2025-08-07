<?php

class Order_RevenueController extends AjaxController {
	
	public function getRevenueInformationAction() {
		$orderId = intval(getPostParam('order_id', 0));
		$record = array();
		if ($orderId) {
			// Get order bill to info
			$query = "SELECT bill_to_id FROM order_base WHERE order_id = $orderId";
			$row = LP_Db::fetchRow($query);
			$record['bill_to_id'] = 0;
			if ($row) {
				$record['bill_to_id'] = $row['bill_to_id'];
			}
			
			// Get linehaul and fuel charges and costs
			$query = "SELECT * FROM order_charge WHERE order_id = $orderId";
			$rows = LP_Db::fetchAll($query);
			if (count($rows)) {
				$record = array_merge($record, $rows[0]);
				
				// Get accessorial charges
				$query = "SELECT
					order_accessorials.*,
					customer_base.customer_name AS bill_to_name,
					ContractManager.dbo.AccessorialCodes.AccCodeDesc AS accessorial_type_name
					FROM order_accessorials
					LEFT JOIN customer_base ON customer_base.customer_id = order_accessorials.bill_to
					LEFT JOIN ContractManager.dbo.AccessorialCodes ON ContractManager.dbo.AccessorialCodes.AccCodeID = order_accessorials.accessorial_type_id
					WHERE order_id = $orderId";
				$rows = LP_Db::fetchAll($query);
				if (count($rows)) {
					for ($i = 0; $i < count($rows); $i++) {
						$rows[$i]['bill_to_id'] = $record['bill_to_id'];
					}
				}
				$record['accessorialCharges'] = $rows;
				
				// Get accessorial costs
				// Get the load id for the order
				$query = "SELECT load_id FROM load_base WHERE order_id = $orderId";
				$loadRow = LP_Db::fetchRow($query);
				if ($loadRow) {
					$loadId = $loadRow['load_id'];
					$query = "SELECT
						load_accessorials.*,
						customer_base.customer_name AS bill_to_name,
						ContractManager.dbo.AccessorialCodes.AccCodeDesc AS accessorial_type_name
						FROM load_accessorials
						LEFT JOIN customer_base ON customer_base.customer_id = load_accessorials.pay_to
						LEFT JOIN ContractManager.dbo.AccessorialCodes ON ContractManager.dbo.AccessorialCodes.AccCodeID = load_accessorials.accessorial_type_id
						WHERE load_id = $loadId";
					$rows = LP_Db::fetchAll($query);
					if (count($rows)) {
						for ($i = 0; $i < count($rows); $i++) {
							$rows[$i]['bill_to_id'] = $record['bill_to_id'];
						}
					}
					$record['accessorialCosts'] = $rows;
				}
				else {
					$record['accessorialCosts'] = false;
				}
			}
		}
		$this->setParam('record', $record);
	}
	
}

// order accessorials for charges
// load accessorials for costs
// order_charge for linehaul and fuel
