<?php

class Customer_LookupController extends AjaxController {
	
	public function customerAction(){
		//Setup the db model
		$db = new DBModel();
		$db->connect();
		
		$contactId = intval(request("contact_id", 0));
		$customerId = intval(request("customer_id", 0));
		$isPayTo = intval(getParam('isPayTo', 0));
		
		// Check if we need to look up the customer based on a contact id
		if ($contactId) {
			$query = "SELECT customer_id FROM location_to_contact, customer_to_location
				WHERE location_to_contact.contact_id = $contactId
				AND location_to_contact.location_id = customer_to_location.location_id";
			$row = LP_Db::fetchRow($query);
			if ($row && isset($row['customer_id'])) {
				$customerId = $row['customer_id'];
			}
		}
		
		//Setup the filtering and query variables
		$searchQuery = request("query", "");
		$searchQuery = LP_Db::escape($searchQuery);
		$start = request("start", 0);
		$limit = request("limit", 10);
		$sort = array(
			'customer_name ASC'
		);
		$where = "customers.active = 1";
		$filter = json_decode(request("filter", json_encode(array())), true);
		
		//Create all the fields
		$fields = array(
			'customers.customer_id',
			'customers.customer_name'
		);
		$fields = implode(', ', $fields);
		
		//create the from
		$from = "customer_base customers";
		
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
		
		//Build the where
		if($customerId){
			$where .= " AND customers.customer_id = '$customerId'";
		}
		else if(strlen($searchQuery)){
			$where = $this->getCustomerSearchQueryWhere($searchQuery, $where);
		}
		
		if ($isPayTo) {
			$where .= " AND customers.status_id = 0";
		}
		else {
			$where .= " AND customers.status_id = 1";
		}
		
		//Get the total
		$query = "SELECT COUNT(*) total FROM $from WHERE $where";
		$result = $db->db->query($query);
		$records = array();
		while($row = $db->db->fetch_assoc($result) ) {
			$this->setParam("total", $row['total']);
		}

		//Run the query and get the results
		$query = "SELECT $fields FROM $from WHERE $where";
		$query = LP_Util::buildQuery($query, $sort, $limit, $start);
		$result = $db->db->query($query);
		$records = array();
		while($row = $db->db->fetch_assoc($result) ) {
			//Add the row to the records
			$records[] = $row;
		}
		
		//Add the records to the response
		$this->setParam("records", $records);
	}
	
	public function getCustomerSearchQueryWhere($searchQuery, $where = ''){
		$wheres = array();
		
		//Search by customer name
		$wheres[] = "customers.customer_name LIKE '$searchQuery%'";
		
		if(count($wheres)){
			$where .= " AND " . $wheres[0];
			array_shift($wheres);
		}
		
		if(count($wheres) > 1){
			$where .= " OR " . implode(" OR ", $wheres);
		}
		else if(count($wheres) == 1){
			$where .= " OR " . array_shift($wheres);
		}
		
		return $where;
	}
	
	public function phoneAction() {
		
		$number = request('phone', '');
		
		$s = "SELECT DISTINCT customer.* FROM customer_base customer
			JOIN customer_to_location c2l ON c2l.customer_id = customer.customer_id
			JOIN location_to_contact l2c ON l2c.location_id = c2l.location_id
			JOIN contact_methods methods ON methods.contact_id = l2c.contact_id
			WHERE methods.method_type_id IN (
				SELECT method_id FROM contact_method_types WHERE method_group_id = '" . ToolsMethodGroups::PhoneType . "'
			)
			AND methods.contact_value_1 LIKE '%" . intval($number) . "%'";
		
		$a = LP_Db::fetchAll($s);
		
		$this->setParam('query', $s);
		$this->setParam('records', $a);
	}
	
	public function emailDomainAction() {
		
		$email = request('domain', '');
		
		$s = "SELECT DISTINCT customer.* FROM customer_base customer
			JOIN customer_to_location c2l ON c2l.customer_id = customer.customer_id
			JOIN location_to_contact l2c ON l2c.location_id = c2l.location_id
			JOIN contact_methods methods ON methods.contact_id = l2c.contact_id
			WHERE methods.method_type_id = '". ContactMethodTypes::Email ."'
			AND methods.contact_value_1 LIKE '%@" . LP_Db::escape($email) . "'";
		
		$a = LP_Db::fetchAll($s);
		
		$this->setParam('query', $s);
		$this->setParam('records', $a);
	}
}