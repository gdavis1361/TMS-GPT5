<?php
class Contact_LookupController extends AjaxController {
	
	public function contactAction(){
		//Setup the filtering and query variables
		$records = array();
		$contactTypeId = intval(request("contactTypeId", 0));
		$locationId = intval(request("location_id", 0));
		$querySearch = request("query", "");
		$start = request("start", 0);
		$limit = request("limit", 10);
		$sort = array(
			'first_name ASC'
		);
		$where = "1=1";
		$filter = json_decode(request("filter", json_encode(array())), true);
		$type = request('type', 'contact');	//Type of join we are doing contact, carrier, customer
		
		//Switch on the type
		switch ($type){
			case "contact":
				//create the from
				$from = "contact_base c
						LEFT JOIN location_to_contact ltc
						ON c.contact_id = ltc.contact_id
						LEFT JOIN location_base l
						ON l.location_id = ltc.location_id";
				$contactId = intval(request("contact_id", 0));
				if($contactId){
					$where .= " AND c.contact_id = '$contactId'";
				}
			break;
		
			case "carrier":
				//Create the from
				$from = "contact_base c, location_to_contact, location_base l, location_to_carriers ";
				
				$carrierId = intval(request("carrier_id", 0));
				if($carrierId){
					$where .= " AND location_to_carriers.carrier_id = '$carrierId'";
				}
				$where .= " AND c.contact_id = location_to_contact.contact_id";
				$where .= " AND location_to_contact.location_id = l.location_id ";
				$where .= " AND l.location_id = location_to_carriers.location_id ";
				
				
			break;
		}
		
		//Create all the fields
		$fields = array(
			'c.contact_id',
			'c.first_name',
			'c.last_name',
			'(c.first_name + \' \' + c.last_name) name',
			'l.location_id',
		);
		$fields = implode(', ', $fields);
		
		//Process the sort
		if(isset($_REQUEST['sort'])){
			$sort = array();
			$sortArray = json_decode($_REQUEST['sort'], true);
			foreach ($sortArray as $sortItem){
				$sort[] = $sortItem['property'] . " " . $sortItem['direction'];
			}
		}
		
		//Build the order/sort
		if(count($sort)){
			$sort = implode(",\n", $sort);
		}
		else{
			$sort = '';
		}
		
		//Add where filters
		if($contactTypeId){
			$where .= " AND c.contact_type_id = '$contactTypeId'";
		}
		
		if(strlen($querySearch)){
			$queryParts = explode(" ", $querySearch);
			if(count($queryParts) == 2){
				$where .= " AND c.first_name LIKE '{$queryParts[0]}%' AND c.last_name LIKE '{$queryParts[1]}%'";
			}
			else{
				$where .= " AND (c.first_name LIKE '$querySearch%' OR c.last_name LIKE '$querySearch%')";
			}
		}
		
		if($locationId){
			$where .= " AND l.location_id = '$locationId'";
		}
		
		
		//Get the total
		$query = "SELECT COUNT(*) total FROM $from WHERE $where";
		$rows = LP_Db::fetchAll($query);
		foreach($rows as $row){
			$this->setParam("total", $row['total']);
		}

		//Run the query and get the results
		$query = "SELECT $fields FROM $from WHERE $where";
		$query = LP_Util::buildQuery($query, $sort, $limit, $start);
		$rows = LP_Db::fetchAll($query);
		foreach($rows as $row){
			//Add the row to the records
			$records[] = $row;
		}
		
		//Add the records to the response
		$this->setParam("records", $records);
	}
	
	public function otherContactsAction(){
		$contactId = intval(getParam('contact_id', 0));
		$customerId = 0;
		
		// Get customer id
		$query = "SELECT customer_base.customer_id FROM customer_base
			LEFT JOIN customer_to_location ON customer_to_location.customer_id = customer_base.customer_id
			LEFT JOIN location_to_contact ON location_to_contact.location_id = customer_to_location.location_id
			WHERE location_to_contact.contact_id = $contactId";
		$row = LP_Db::fetchRow($query);
		if ($row) {
			$customerId = $row['customer_id'];
		}
		
		// get submitted params
		$sortBy = getParam('sort', false);
		$filter = json_decode(getParam('filter', '{}'), true);
		
		// Setup the filtering and query variables
		$start = intval(getParam('start', 0));
		$limit = intval(getParam('limit', 10));
		
		// build query data
		$fields = array(
			'contact_base.contact_id',
			'contact_base.first_name',
			'contact_base.last_name',
			"(contact_base.first_name + ' ' + contact_base.last_name) AS name"
		);
		$from = array(
			'contact_base'
		);
		$join = array(
			'LEFT JOIN location_to_contact ON location_to_contact.contact_id = contact_base.contact_id',
			'LEFT JOIN customer_to_location ON customer_to_location.location_id = location_to_contact.location_id',
			'LEFT JOIN customer_base ON customer_base.customer_id = customer_to_location.customer_id'
		);
		$where = array(
			"customer_base.customer_id = $customerId",
			"contact_base.contact_id <> $contactId"
		);
		$sort = array(
			'first_name, last_name ASC'
		);
		
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
		$query = "SELECT $fieldsSql $fromSql $joinSql $whereSql ";
		$this->setParam('query', $query);
		$query = LP_Util::buildQuery($query, $sortSql, $limit, $start);
		$rows = LP_Db::fetchAll($query);
		$numRows = count($rows);
		
		$this->setParam('records', $rows);
	}
	
	public function phoneAction(){
		$phone = intval(request('phone', ''));
		
		$s = "SELECT * FROM contact_base WHERE contact_id IN (
				SELECT contact_id FROM contact_methods WHERE contact_value_1 LIKE '%$phone%' AND method_type_id IN (
					SELECT method_id FROM contact_method_types WHERE method_group_id = '" . ToolsMethodGroups::$PHONE . "'
				)
			)";
		
		$a = LP_Db::fetchAll($s);
		
		
		$this->setParam('record', $a);
	}
	
}
