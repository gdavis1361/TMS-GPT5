<?php

class Order_PreOrderController extends AjaxController {

	public function getAction() {
		
		//Setup any data we need to run this query
		$session = $GLOBALS['oSession'];

		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);

		// Setup the filtering and query variables
		$start = intval(getParam('start', 0));
		$limit = intval(getParam('limit', 10));
		
		// build query data
		$fields = array(
			'pre_order_base.*',
			'pre_order_charge.total_charge',
			'pre_order_charge.fuel_charge',
			'pre_order_charge.linehaul_charge',
			'pre_order_charge.accessorial_charge',
			'pre_order_charge.created_by_id AS charge_created_by_id',
			'pre_order_charge.created_at AS charge_created_at',
			'pre_order_charge.updated_by_id AS charge_updated_by_id',
			'pre_order_charge.updated_at AS charge_updated_at',
			'(contact_base.first_name + \' \' + contact_base.last_name) AS broker_name',
			'contact_base.contact_id',
			
			'customer_base.customer_name',
			
			'contact_base2.first_name ordered_by_first_name',
			'contact_base2.last_name ordered_by_last_name',
			'(contact_base2.first_name + \' \' + contact_base2.last_name) AS ordered_by_name',
		);
		$from = array(
			'pre_order_base'
		);
		$join = array(
			'LEFT JOIN pre_order_charge ON pre_order_charge.pre_order_id = pre_order_base.pre_order_id',
			'LEFT JOIN user_base ON user_base.user_id = pre_order_base.broker_id',
			'LEFT JOIN contact_base ON contact_base.contact_id = user_base.contact_id',
			'LEFT JOIN customer_base ON customer_base.customer_id = pre_order_base.customer_id',
			'LEFT JOIN contact_base contact_base2 ON contact_base2.contact_id = pre_order_base.ordered_by_id',
		);
		
		$where = array(
			'pre_order_base.active = 1',
			'pre_order_base.broker_id IN (' . implode(',', $session->session_var('user_scope')) . ')'
		);
		$sort = array(
			'pre_order_id DESC'
		);
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}

		//Process any filters
		foreach ($filter as $key => $value) {
			if (strlen($value)) {
				$cleanValue = LP_Db::escape($value);
				switch ($key) {
					case 'name':
						$where[] = "(contact.first_name LIKE '$cleanValue%' OR contact.last_name LIKE '$cleanValue%')";
					break;

					case 'company':
						$where[] = "customer_base.customer_name LIKE '$cleanValue%'";
					break;
					
					case 'owner':
						$where[] = "(contact_base.first_name LIKE '$cleanValue%' OR contact_base.last_name LIKE '$cleanValue%')";
					break;
				
					case 'carrier':
						$where[] = "(ContractManager.dbo.CarrierMaster.CarrName LIKE '$cleanValue%')";
					break;
				
					case 'ordered_by_id':
						$where[] = "(contact_base2.contact_id = '$cleanValue')";
						break;
					
					case 'customer_id':
						$where[] = "(customer_base.customer_id = '$cleanValue')";
						break;
					
					case 'carrier_id':
						$where[] = "(ContractManager.dbo.CarrierMaster.CarrID = '$cleanValue')";
						break;
					
					case 'bolNumber':
						$join[] = ' JOIN pre_order_details ON pre_order_details.pre_order_id = pre_order_base.pre_order_id';
						$join[] = ' JOIN tools_detail_types ON tools_detail_types.detail_type_id = pre_order_details.detail_type';
						$where[] = "tools_detail_types.detail_type_id = 14";
						$where[] = "pre_order_details.detail_value = '$cleanValue'";
						break;
					
					case 'proNumber':
						$join[] = ' JOIN pre_order_details ON pre_order_details.pre_order_id = pre_order_base.pre_order_id';
						$join[] = ' JOIN tools_detail_types ON tools_detail_types.detail_type_id = pre_order_details.detail_type';
						$where[] = "tools_detail_types.detail_type_id = 15";
						$where[] = "pre_order_details.detail_value = '$cleanValue'";
						break;
					
					case 'customerReference':
						$join[] = ' JOIN pre_order_details ON pre_order_details.pre_order_id = pre_order_base.pre_order_id';
						$join[] = ' JOIN tools_detail_types ON tools_detail_types.detail_type_id = pre_order_details.detail_type';
						$where[] = "tools_detail_types.detail_type_id = 16";
						$where[] = "pre_order_details.detail_value = '$cleanValue'";
						break;
					
					case 'quickSearch':
						if (strlen($value)) {
							// this join causes the count to be off if there is more than one detail for an order
//							$fields[] = 'tools_detail_types.detail_type_id';
//							$fields[] = 'tools_detail_types.detail_type_name';
//							$fields[] = 'pre_order_details.detail_value';
//							$fields[] = "(SELECT TOP 1 order_details.detail_value FROM order_details WHERE pre_order_details.pre_order_id = pre_order_base.pre_order_id) AS detail_value";
							$join[] = ' JOIN pre_order_details ON pre_order_details.pre_order_id = pre_order_base.pre_order_id';
							$join[] = ' JOIN tools_detail_types ON tools_detail_types.detail_type_id = pre_order_details.detail_type';
							$conditions = array();
							if (intval($cleanValue)) {
								$conditions[] = "pre_order_base.pre_order_id = $cleanValue";
							}
							$conditions[] = "detail_value = '$cleanValue'";
							$conditions[] = "contact_base.first_name LIKE '$cleanValue%'";
							$conditions[] = "contact_base.last_name LIKE '$cleanValue%'";
							$conditions[] = "customer_base.customer_name LIKE '$cleanValue%'";
							$where[] = '(' . implode(' OR ', $conditions) . ')';
						}
						break;
				
				}
			}
		}
		
		// convert query data to sql
		$fieldsSql = implode(',', $fields);
		$fromSql = ' FROM ' . implode(',', $from);
		$joinSql = implode(' ', $join);
		$whereSql = 'WHERE ' . implode(' AND ', $where);
		if (!count($where)) {
			$whereSql = '';
		}
		$sortSql = implode(',', $sort);

		// get total count
		$total = 0;
		$totalQuery = "SELECT COUNT(*) total $fromSql $joinSql $whereSql ";
		$row = LP_Db::fetchRow($totalQuery);
		if ($row) {
			$total = $row['total'];
		}
		$this->setParam('total', $total);

		// get records
		$query = "SELECT DISTINCT $fieldsSql $fromSql $joinSql $whereSql ";
		$this->setParam('query', $query);
		$query = LP_Util::buildQuery($query, $sortSql, $limit, $start);
		$rows = LP_Db::fetchAll($query);
		$numRows = count($rows);
		
		for ($i = 0; $i < $numRows; $i++) {
			//Apply the stop information (origin/destination)
			$rows[$i] = $this->applyStopInfo($rows[$i]);
			
			// Set date format
			$rows[$i]['expiration_date'] = date('n/j/y', strtotime($rows[$i]['expiration_date']));
		}
		
		$this->setParam('records', $rows);
	}

	public function applyStopInfo($row) {
		//Set default values
		$row['origin'] = "<span class='missing_location'>Destination Not Specified!</span>";
		$row['origin_stop_id'] = 0;
		$row['destination'] = "<span class='missing_location'>Destination Not Specified!</span>";
		$row['destination_stop_id'] = 0;

		$query = "SELECT 
					stop.*
				FROM 
					pre_order_stops stop
				WHERE 
					stop.pre_order_id = '{$row['pre_order_id']}'
				ORDER BY 
					stop.stop_index ASC";
		$rows = LP_Db::fetchAll($query);
		$stops = array();
		foreach ($rows as $stopRow) {
			$stops[] = $stopRow;
		}

		if (count($stops)) {
			$originStop = $stops[0];
			$destinationStop = $stops[count($stops) - 1];

			//Get the origin info
			$query = "SELECT 
						TOP 1
						* 
						FROM 
							ContractManager.dbo.ZipsPostalCodesUS
						WHERE Zip = '{$originStop['zip_code']}'";
			$rows = LP_Db::fetchAll($query);
			$stops = array();
			foreach ($rows as $zipRow) {
				$date = date('m/d/Y', strtotime($originStop['schedule_date']));
				$row['origin_stop_id'] = $originStop['pre_order_stops_id'];
				$row['origin'] = "<p class=\"city_state\">
						{$zipRow['City']}, {$zipRow['State']}
						<br />
						{$zipRow['Zip']}
				</p>";
			}

			//Get the destination info
			$query = "SELECT 
						TOP 1
						* 
						FROM 
							ContractManager.dbo.ZipsPostalCodesUS
						WHERE Zip = '{$destinationStop['zip_code']}'";
			$rows = LP_Db::fetchAll($query);
			foreach ($rows as $zipRow) {
				$date = date('m/d/Y', strtotime($destinationStop['schedule_date']));
				$row['destination_stop_id'] = $destinationStop['pre_order_stops_id'];
				$row['destination'] = "<p class=\"city_state\">
						{$zipRow['City']}, {$zipRow['State']}
						<br />
						{$zipRow['Zip']}
				</p>";
			}
		}

		return $row;
	}

}