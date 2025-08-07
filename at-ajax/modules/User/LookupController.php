<?php

class User_LookupController extends AjaxController {

	public function getUserListAction() {
		//Setup the filtering and query variables
		$searchQuery = request("query", "");
		$start = request("start", 0);
		$limit = request("limit", 10);
		$sort = array(
			'first_name ASC',
			'last_name ASC'
		);
		
		$myUserId = get_user_id();
		
		$where = "user_id <> $myUserId";
		$filter = json_decode(request("filter", json_encode(array())), true);
		
		//Create all the fields
		$fields = array(
			'first_name',
			'last_name',
			'user_id'
		);
		$fields = implode(', ', $fields);
		
		//create the from
		$from = "user_base
			LEFT JOIN
				contact_base
			ON 
				user_base.contact_id = contact_base.contact_id";
		
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
		
		if(strlen($searchQuery)){
			$where .= $this->getSearchQueryWhere($searchQuery);
		}
		
		//Get the total
		$query = "SELECT COUNT(*) total FROM $from WHERE $where";
		$row = LP_Db::fetchRow($query);
		$total = 0;
		if ($row) {
			$total = $row['total'];
		}
		$this->setParam('total', $total);
		
		$records = array();
		//Run the query and get the results
		$query = "SELECT $fields FROM $from WHERE $where";
		$query = LP_Util::buildQuery($query, $sort, $limit, $start);
		$records = LP_Db::fetchAll($query);
		for ($i = 0; $i < count($records); $i++) {
			$records[$i]['name'] = $records[$i]['first_name'] . ' ' . $records[$i]['last_name'];
		}
		
		//Add the records to the response
		$this->setParam("records", $records);
	}
	
	public function getSearchQueryWhere($searchQuery){
		$wheres = array();
		$where = ' AND ';
		
		//Search by first name
		$wheres[] = "first_name LIKE '".LP_Db::escape($searchQuery)."%'";
		
		//Search by last name
		$wheres[] = "last_name LIKE '".LP_Db::escape($searchQuery)."%'";
		
		$where .= '(' . implode(' OR ', $wheres) . ')';
		
		return $where;
	}
}