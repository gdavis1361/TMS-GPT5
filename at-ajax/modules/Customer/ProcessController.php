<?php
class Customer_ProcessController extends AjaxController {
	
	public function addAction() {
		$isPayTo = intval(getParam('isPayTo', 0));
		$statusId = 1;
		if ($isPayTo) {
			$statusId = 0;
		}
		
		$customerName = getParam('customerName');
		$customerBase = new CustomerBase();
		$params = array(
			'customer_name' => $customerName,
			'managed_by_id' => get_user_id(),
			'industry_id' => 0,
			'location_id' => 0,
			'status_id' => $statusId
		);
		$success = $customerBase->create($params);
		if ($success) {
			$this->setParam('record', $customerBase->get());
		}
		else {
			foreach($customerBase->getErrors() as $field => $value){
				if($field == "customer_name"){
					$field = "customerName";
				}
				$this->addError($value, $field);
			}
		}
	}
	
	public function processAction(){
		$name = request('name', '');
		$industryId = 0;
		$locationId = intval(request('location_id', 0));

		$customerBase = new CustomerBase();
		$customerBase->create(array(
			'customer_name' => $name,
			'managed_by_id' => get_user_id(),
			'industry_id' => $industryId,
			'location_id' => $locationId
		));
		
		$this->setParam("record", $customerBase->get());
	}
	
	public function addLocationAction(){
		$customerId = intval(request("customer_id", 0));
		$locationId = intval(request("location_id", 0));
		if($customerId && $locationId){
			$customerBase = new CustomerBase();
			$customerBase->load($customerId);
			$customerBase->add_location($locationId);
		}
	}
	
	public function addDuplicateAction(){
		$customerId = intval(request("customer_id", 0));
		$duplicateId = intval(request("duplicate_id", 0));
		if($customerId && $duplicateId){
			$customer = new CustomerBase();
			$customer->markDuplicate($customerId, $duplicateId);
		}
	}
	
	public function getDuplicateRecordsAction(){
		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);
		
		// Setup the filtering and query variables
		$start = intval(request('start', 0));
		$limit = intval(request('limit', 10));
		
		// build query data
		$fields = array(
			'customer_base.customer_id',
			'customer_base.customer_name'
		);
		$from = array(
			'customer_duplicates'
		);
		$join = array('LEFT JOIN customer_base ON customer_duplicates.duplicate_id = customer_base.customer_id');
		$where = array( 'customer_duplicates.customer_id = ' . intval(request( 'customer_id', 0 )) );
		$sort = array(
			'customer_name ASC'
		);
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}
		
		// convert query data to sql
		$fieldsSql = implode(',', $fields);
		$fromSql = ' FROM ' . implode(',', $from);
		$joinSql = implode(' ', $join);
		
		//Process any filters
		foreach($filter as $key => $value){
			if(strlen($value)){
				$cleanValue = LP_Db::escape($value);
				switch ($key){
					case "name":
						$where[] = "customer_base.customer_name LIKE '$cleanValue%'";
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
		
		$this->setParam('records', $rows);
	}
	
	public function getGridRecordsAction() {
		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);
		
		// Setup the filtering and query variables
		$start = intval(request('start', 0));
		$limit = intval(request('limit', 10));
		
		// build query data
		$fields = array(
			'customer_base.customer_id',
			'customer_base.customer_name',
			'tmp.location_count'
		);
		$from = array(
			'customer_base'
		);
		$join = array('LEFT JOIN (SELECT COUNT(*) as location_count, customer_id FROM customer_to_location GROUP BY customer_id) tmp ON tmp.customer_id = customer_base.customer_id');
		$where = array('customer_base.active = 1');
		$sort = array(
			'customer_name ASC'
		);
		if ($sortBy) {
			$sortArray = json_decode($sortBy, true);
			$numSorters = count($sortArray);
			$sort = array();
			for ($i = 0; $i < $numSorters; $i++) {
				$sort[] = $sortArray[$i]['property'] . ' ' . $sortArray[$i]['direction'];
			}
		}
		
		// convert query data to sql
		$fieldsSql = implode(',', $fields);
		$fromSql = ' FROM ' . implode(',', $from);
		$joinSql = implode(' ', $join);
		
		//Process any filters
		foreach($filter as $key => $value){
			if(strlen($value)){
				$cleanValue = LP_Db::escape($value);
				switch ($key){
					case "name":
						$where[] = "customer_base.customer_name LIKE '$cleanValue%'";
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
		
		$this->setParam('records', $rows);
	}
	
	public function getLocationsAction() {
		$customerId = intval(getParam('customer_id', 0));
		$rows = array();
		
		$query = "SELECT location_base.*
			FROM location_base, customer_to_location
			WHERE location_base.location_id = customer_to_location.location_id
			AND customer_to_location.customer_id = $customerId";
		$rows = LP_Db::fetchAll($query);
		$this->setParam('records', $rows);
	}
	
	public function getContactsAction() {
		$customerId = intval(request('customer_id', 0));
		$statusId = intval(getPostParam('status_id', 0));
		$customer = new CustomerBase();
		$customer->load($customerId);
		$rows = $customer->getContacts($statusId);
		$this->setParam('records', $rows);
	}
}