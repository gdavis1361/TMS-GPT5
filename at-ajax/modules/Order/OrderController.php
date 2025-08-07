<?php

class Order_OrderController extends AjaxController {

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
			'order_base.order_id',
			'order_base.status_id',
			'order_base.customer_id',
			'order_base.bill_to_id',
			'order_base.broker_id',
			
			'order_charge.charge_id',
			'order_charge.total_charge',
			'order_charge.fuel_charge',
			'order_charge.linehaul_charge',
			'order_charge.accessorial_charge',
			'order_charge.total_cost',
			'order_charge.fuel_cost',
			'order_charge.linehaul_cost',
			'order_charge.accessorial_cost',
			'order_charge.total_profit',
			'order_charge.total_profit_pct',
			'order_charge.created_by_id AS charge_created_by_id',
			'order_charge.created_at AS charge_created_at',
			'order_charge.updated_by_id AS charge_updated_by_id',
			'order_charge.updated_at AS charge_updated_at',
			
			'(contact_base.first_name + \' \' + contact_base.last_name) AS broker_name',
			'contact_base.contact_id',
			'customer_base.customer_name',
			
			'customer_base2.customer_name bill_to_name',
			
			'contact_base2.contact_id ordered_by_id',
			'contact_base2.first_name ordered_by_first_name',
			'contact_base2.last_name ordered_by_last_name',
			'(contact_base2.first_name + \' \' + contact_base2.last_name) AS ordered_by_name',
			
			'tools_status_types.status_name'
		);
		$from = array(
			'order_base'
		);
		$join = array(
			'LEFT JOIN order_charge ON order_charge.order_id = order_base.order_id',
			'LEFT JOIN user_base ON user_base.user_id = order_base.broker_id',
			'LEFT JOIN contact_base ON contact_base.contact_id = user_base.contact_id',
			'LEFT JOIN customer_base ON customer_base.customer_id = order_base.customer_id',
			'LEFT JOIN customer_base customer_base2 ON customer_base2.customer_id = order_base.bill_to_id',
			'LEFT JOIN tools_status_types ON tools_status_types.status_id = order_base.status_id',
			'LEFT JOIN contact_base contact_base2 ON contact_base2.contact_id = order_base.ordered_by_id',
			'LEFT JOIN load_base ON load_base.order_id = order_base.order_id',
			'LEFT JOIN ContractManager.dbo.CarrierMaster ON ContractManager.dbo.CarrierMaster.CarrID = load_base.carrier_id'
		);
		$where = array(
			'order_base.active = 1',
			//'order_base.status_id <> ' . ToolsStatusTypes::OrderDelivered,
			'order_base.broker_id IN (' . implode(', ', $session->session_var('user_scope')) . ')'
		);
		$sort = array(
			'order_id DESC'
		);
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				if ($sortArray[$i]['property'] == 'carrier_name') {
					$sortArray[$i]['property'] = 'ContractManager.dbo.CarrierMaster.CarrName';
				}
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}

		//Process any filters
		foreach ($filter as $key => $value) {
			if (strlen($value)) {
				$cleanValue = LP_Db::escape($value);
				switch ($key) {
					case 'status':
						if ($value > 0) {
							$where[] = "order_base.status_id = '$cleanValue'";
						}
						break;

					case 'company':
						$where[] = "customer_base.customer_name LIKE '$cleanValue%'";
						break;

					case 'ordered_by':
						$where[] = "(contact_base2.first_name LIKE '$cleanValue%' OR contact_base2.last_name LIKE '$cleanValue%')";
						break;
					
					case 'bill_to':
						$where[] = "customer_base2.customer_name LIKE '$cleanValue%'";
						break;

					case 'owner':
						$where[] = "(contact_base.first_name LIKE '$cleanValue%' OR contact_base.last_name LIKE '$cleanValue%')";
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
						$join[] = ' JOIN order_details ON order_details.order_id = order_base.order_id';
						$join[] = ' JOIN tools_detail_types ON tools_detail_types.detail_type_id = order_details.detail_type';
						$where[] = "tools_detail_types.detail_type_id = 14";
						$where[] = "order_details.detail_value = '$cleanValue'";
						break;
					
					case 'proNumber':
						$join[] = ' JOIN order_details ON order_details.order_id = order_base.order_id';
						$join[] = ' JOIN tools_detail_types ON tools_detail_types.detail_type_id = order_details.detail_type';
						$where[] = "tools_detail_types.detail_type_id = 15";
						$where[] = "order_details.detail_value = '$cleanValue'";
						break;
					
					case 'customerReference':
						$join[] = ' JOIN order_details ON order_details.order_id = order_base.order_id';
						$join[] = ' JOIN tools_detail_types ON tools_detail_types.detail_type_id = order_details.detail_type';
						$where[] = "tools_detail_types.detail_type_id = 16";
						$where[] = "order_details.detail_value = '$cleanValue'";
						break;
					
					case 'origin':
						
						break;
					
					
					case 'quickSearch':
						if (strlen($value)) {
							// this join causes the count to be off if there is more than one detail for an order
//							$fields[] = 'tools_detail_types.detail_type_id';
//							$fields[] = 'tools_detail_types.detail_type_name';
//							$fields[] = 'order_details.detail_value';
//							$fields[] = "(SELECT TOP 1 order_details.detail_value FROM order_details WHERE order_details.order_id = order_base.order_id) AS detail_value";
							$join[] = ' JOIN order_details ON order_details.order_id = order_base.order_id';
							$join[] = ' JOIN tools_detail_types ON tools_detail_types.detail_type_id = order_details.detail_type';
							$conditions = array();
							if (intval($cleanValue)) {
								$conditions[] = "order_base.order_id = $cleanValue";
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
		if (!isset($filter['status']) || $filter['status'] === -1) {
			$where[] = 'order_base.status_id <> ' . ToolsStatusTypes::OrderDelivered;
		}
		$whereSql = 'WHERE ' . implode(' AND ', $where);
		if (!count($where)) {
			$whereSql = '';
		}
		$sortSql = implode(',', $sort);

		// get total count
		$total = 0;
		$totalQuery = "SELECT COUNT(*) total $fromSql $joinSql $whereSql";
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

			//Apply load info
			$rows[$i] = $this->applyLoads($rows[$i]);
			
			// Set order id display
			$rows[$i]['order_display'] = OrderBase::getOrderIdDisplayStatic($rows[$i]['order_id']);
			
			if (isset($rows[$i]['total_profit_pct'])) {
				$rows[$i]['total_profit_pct'] = $rows[$i]['total_profit_pct'] * 100;
			}
		}
		
		
		$this->setParam('records', $rows);
	}
	
	public function getGridRecordsAction() {
		// get submitted params
		$type = getParam('type', 'contact');
		$contact_id = intval(getParam('contact_id', 0));
		$carrier_id = intval(getParam('carrier_id', 0));
		$customer_id = intval(getParam('customer_id', 0));
		
		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);
		
		// Setup the filtering and query variables
		$start = intval(getParam('start', 0));
		$limit = intval(getParam('limit', 10));
		
		// build query data
		$fields = array(
			'order_base.order_id',
			'order_base.status_id',
			'order_base.customer_id',
			'order_base.bill_to_id',
			'order_base.broker_id',
			'tools_status_types.status_name',
			'customer_base.customer_name',
			'customer_base2.customer_name bill_to_name',
			'contact_base.contact_id broker_contact_id',
			'contact_base.first_name broker_first_name',
			'contact_base.last_name broker_last_name',
			'(contact_base.first_name + \' \' + contact_base.last_name) AS broker_name',
			'contact_base2.contact_id ordered_by_id',
			'contact_base2.first_name ordered_by_first_name',
			'contact_base2.last_name ordered_by_last_name',
			'(contact_base2.first_name + \' \' + contact_base2.last_name) AS ordered_by_name',
			'load_base.load_id'
		);
		$from = array(
			'order_base'
		);
		$join = array(
			'LEFT JOIN tools_status_types ON tools_status_types.status_id = order_base.status_id',
			'LEFT JOIN customer_base ON customer_base.customer_id = order_base.customer_id',
			'LEFT JOIN customer_base customer_base2 ON customer_base2.customer_id = order_base.bill_to_id',
			'LEFT JOIN user_base ON order_base.broker_id = user_base.user_id',
			'LEFT JOIN contact_base ON contact_base.contact_id = user_base.contact_id',
			'LEFT JOIN contact_base contact_base2 ON contact_base2.contact_id = order_base.ordered_by_id',
			'LEFT JOIN load_base ON load_base.order_id = order_base.order_id',
			'LEFT JOIN ContractManager.dbo.CarrierMaster ON ContractManager.dbo.CarrierMaster.CarrID = load_base.carrier_id'
		);
		$where = array();
		$sort = array(
			'order_id DESC'
		);
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}

		// apply filter based on type of order display
		switch ($type) {
			case 'contact':
				$contact = new ContactBase();
				$contact->load($contact_id);
				if ($contact->get('contact_type_id') == ContactTypes::Customer) {
					$where[] = "ordered_by_id = $contact_id";
				}
				else if ($contact->get('contact_type_id') == ContactTypes::AATEmployee) {
					$user = new UserBase();
					$user->load(array(
						'contact_id' => $contact->get('contact_id')
					));
					$where[] = "broker_id = {$user->get('user_id')}";
				}
				break;

			case 'carrier':
				$where[] = "load_base.carrier_id = $carrier_id";
				break;

			case 'customer':
				$where[] = "order_base.customer_id = $customer_id";
				break;
		}

		// convert query data to sql
		$fieldsSql = implode(',', $fields);
		$fromSql = ' FROM ' . implode(',', $from);
		$joinSql = implode(' ', $join);

		//Process any filters
		foreach ($filter as $key => $value) {
			if (strlen($value)) {
				$cleanValue = LP_Db::escape($value);
				switch ($key) {
					case 'status':
						if ($value > 0) {
							$where[] = "order_base.status_id = '$cleanValue'";
						}
						break;

					case 'company':
						$where[] = "customer_base.customer_name LIKE '$cleanValue%'";
						break;

					case 'ordered_by':
						$where[] = "(contact_base2.first_name LIKE '$cleanValue%' OR contact_base2.last_name LIKE '$cleanValue%')";
						break;

					case 'bill_to':
						$where[] = "customer_base2.customer_name LIKE '$cleanValue%'";
						break;

					case 'owner':
						$where[] = "(contact_base.first_name LIKE '$cleanValue%' OR contact_base.last_name LIKE '$cleanValue%')";
						break;

					case 'carrier':
						$where[] = "(ContractManager.dbo.CarrierMaster.CarrName LIKE '$cleanValue%')";
						break;
				}
			}
		}

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
		$query = "SELECT $fieldsSql $fromSql $joinSql $whereSql ";
		$this->setParam('query', $query);
		$query = LP_Util::buildQuery($query, $sortSql, $limit, $start);
		$rows = LP_Db::fetchAll($query);

		// store order ids to look up carrier info
		$orderIds = array();

		// loop through rows to generate display data
		$numRows = count($rows);
		for ($i = 0; $i < $numRows; $i++) {
			//Apply the stop information (origin/destination)
			$rows[$i] = $this->applyStopInfo($rows[$i]);
			
			//Apply load info
			$rows[$i] = $this->applyLoads($rows[$i]);
			
			$rows[$i]['order_display'] = OrderBase::getOrderIdDisplayStatic($rows[$i]['order_id']);
			$orderIds[] = $rows[$i]['order_id'];
		}

		if (count($orderIds)) {
			$carrierRecords = OrderBase::getCarrierNames($orderIds);
			for ($i = 0; $i < $numRows; $i++) {
				if (isset($carrierRecords[$rows[$i]['load_id']])) {
					$rows[$i] = array_merge($rows[$i], $carrierRecords[$rows[$i]['load_id']]);
				}
			}
		}


		$this->setParam('records', $rows);
	}

	public function applyStopInfo($row) {
		//Setup the db model
		$db = new DBModel();
		$db->connect();

		//Set default values
		$row['origin'] = "<span class='missing_location'>Destination Not Specified!</span>";
		$row['origin_stop_id'] = 0;
		$row['destination'] = "<span class='missing_location'>Destination Not Specified!</span>";
		$row['destination_stop_id'] = 0;

		$query = "SELECT 
					location.*,
					stop.*
				FROM 
					order_stops stop
				LEFT JOIN 
					tms.dbo.location_base location 
				ON 
					location.location_id = stop.location_id
				WHERE 
					stop.order_id = '{$row['order_id']}'
				ORDER BY 
					stop.stop_index ASC";
		$result = $db->db->query($query);
		$stops = array();
		while ($stopRow = $db->db->fetch_assoc($result)) {
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
						WHERE Zip = '{$originStop['zip']}'";
			$result = $db->db->query($query);
			$stops = array();
			while ($zipRow = $db->db->fetch_assoc($result)) {
				$date = strtotime($originStop['schedule_date']) > 0 ? date('m/d/Y', strtotime($originStop['schedule_date'])) : '';
				$row['origin_stop_id'] = $originStop['order_stops_id'];
				$row['origin'] = !empty($date) ? "<p class=\"stop_date\">$date</p>" : "";
				$row['origin'] .= "<p class=\"city_state\">
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
						WHERE Zip = '{$destinationStop['zip']}'";
			$result = $db->db->query($query);
			$stops = array();
			while ($zipRow = $db->db->fetch_assoc($result)) {
				$date = strtotime($destinationStop['schedule_date']) > 0 ? date('m/d/Y', strtotime($destinationStop['schedule_date'])) : '';
				$row['destination_stop_id'] = $destinationStop['order_stops_id'];
				$row['destination'] = !empty($date) ? "<p class=\"stop_date\">$date</p>" : "";
				$row['destination'] .= "
					<p class=\"city_state\">
						{$zipRow['City']}, {$zipRow['State']}
						<br />
						{$zipRow['Zip']}
				</p>";
			}
		}

		return $row;
	}

	public function applyLoads($row) {
		//Setup the db model
		$db = new DBModel();
		$db->connect();

		//Apply defaults
		$row['carrier_id'] = 0;
		$row['carrier_name'] = '';

		/*
		 * Query for Carriers
		 */
		$query = "SELECT TOP 1 load.*, carrier.CarrName as carrier_name, load.order_id FROM tms.dbo.load_base load 
				LEFT JOIN ContractManager.dbo.CarrierMaster carrier ON carrier.CarrID = load.carrier_id " .
//				LEFT JOIN tms.dbo.movement_to_load m2l ON m2l.load_id = load.load_id
//				LEFT JOIN tms.dbo.order_to_movement o2m ON o2m.movement_id = m2l.movement_id
				"
				WHERE load.order_id = '{$row['order_id']}'";
		$result = $db->db->query($query);
		$loads = array();
		while ($loadRow = $db->db->fetch_assoc($result)) {
			$row['carrier_id'] = $loadRow['carrier_id'];
			$row['carrier_name'] = $loadRow['carrier_name'];
		}
		return $row;
	}

	public function updateStatusAction() {
		$statusId = intval(request("status_id", 0));
		$orderId = intval(request("order_id", 0));
		if ($statusId && $orderId) {
			$orderBase = new OrderBase();
			$orderBase->load($orderId);
			$orderBase->set("status_id", $statusId);
			$orderBase->save();
			$orderBase->checkTasks();
		}
	}

	public function getStopsAction() {
		$orderId = intval(request('order_id', 0));
		$preOrderId = intval(request('pre_order_id', 0));
		$type = request('type', 'order');
		
		$records = array();
		
		if ($type == 'order') {
			if ($orderId) {
				$orderBase = new OrderBase();
				$orderBase->load($orderId);
				$stops = $orderBase->getStops();
				$stopDetails = $orderBase->getStopDetails();

				//{"location_id":4,"contact_id":40,"date":"2011-07-12T00:00:00","time":"2008-01-01T01:15:00","stop_type":"p","detail_type_id[]":9,"detail_type_data[]":"","details":[{"detail_type_id":9,"value":"Detail One"},{"detail_type_id":9,"value":"Detail Two"},{"detail_type_id":9,"value":""}]},{"location_id":238,"contact_id":333,"date":"2011-07-27T00:00:00","time":"2008-01-01T02:45:00","stop_type":"d","detail_type_id[]":9,"detail_type_data[]":"","details":[{"detail_type_id":9,"value":"Detail One Stop Two"},{"detail_type_id":9,"value":""}]}]
				//Format the stops
				foreach ($stops as $stop) {
					//Get the stop details
					$details = array();
					if (isset($stopDetails[$stop['stop_index']])) {
						$details = $stopDetails[$stop['stop_index']];
					}

					//Create the record
					$record = array(
						"stop_id" => $stop['order_stops_id'],
						"location_id" => intval($stop['location_id']),
						"location_name_1" => $stop['location_name_1'],
						"address_1" => $stop['address_1'],
						"city" => $stop['city'],
						"state" => $stop['state'],
						"zip" => $stop['zip'],
						"lat" => $stop['lat'],
						"lng" => $stop['lng'],
						"contact_id" => intval($stop['contact_id']),
						"first_name" => $stop['first_name'],
						"last_name" => $stop['last_name'],
						"name" => trim($stop['name']),
						"date" => $stop['date1'],
						"time" => $stop['date2'],
						"stop_type" => $stop['stop_type'],
						"details" => $details
					);

					//Ensure nulls are blank
					foreach ($record as $key => $value) {
						if ($value == null) {
							$record[$key] = '';
						}
					}

					$records[] = $record;
				}
			}
		}
		else if ($type == 'preorder') {
			if ($preOrderId) {
				$preOrderBase = new PreOrderBase();
				$preOrderBase->load($preOrderId);
				$stops = $preOrderBase->getStops();
				$stopDetails = $preOrderBase->getStopDetails();

				//{"location_id":4,"contact_id":40,"date":"2011-07-12T00:00:00","time":"2008-01-01T01:15:00","stop_type":"p","detail_type_id[]":9,"detail_type_data[]":"","details":[{"detail_type_id":9,"value":"Detail One"},{"detail_type_id":9,"value":"Detail Two"},{"detail_type_id":9,"value":""}]},{"location_id":238,"contact_id":333,"date":"2011-07-27T00:00:00","time":"2008-01-01T02:45:00","stop_type":"d","detail_type_id[]":9,"detail_type_data[]":"","details":[{"detail_type_id":9,"value":"Detail One Stop Two"},{"detail_type_id":9,"value":""}]}]
				//Format the stops
				foreach ($stops as $stop) {
					//Get the stop details
					$details = array();
					if (isset($stopDetails[$stop['stop_index']])) {
						$details = $stopDetails[$stop['stop_index']];
					}

					//Create the record
					$record = array(
						"stop_id" => $stop['pre_order_stops_id'],
						"location_id" => intval($stop['location_id']),
						"location_name_1" => $stop['location_name_1'],
						"address_1" => $stop['address_1'],
						"city" => $stop['city'],
						"state" => $stop['state'],
						"zip" => $stop['zip'],
						"lat" => $stop['lat'],
						"lng" => $stop['lng'],
						"contact_id" => intval($stop['contact_id']),
						"first_name" => $stop['first_name'],
						"last_name" => $stop['last_name'],
						"name" => trim($stop['name']),
						"date" => $stop['date1'],
						"time" => $stop['date2'],
						"stop_type" => $stop['stop_type'],
						"details" => $details,
						"zip" => $stop['zip_code']
					);

					//Ensure nulls are blank
					foreach ($record as $key => $value) {
						if ($value == null) {
							$record[$key] = '';
						}
					}

					$records[] = $record;
				}
			}
		}
		$this->setParam("records", $records);
	}

}