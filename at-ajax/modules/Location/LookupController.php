<?php

class Location_LookupController extends AjaxController {

	public function locationAction() {
		$contactId = intval(request("contact_id", 0));
		$locationId = intval(request("location_id", 0));

		// Check if we need to look up the location based on a contact id
		if ($contactId) {
			$query = "SELECT location_to_contact.location_id FROM location_to_contact
				WHERE location_to_contact.contact_id = $contactId";
			$row = LP_Db::fetchRow($query);
			if ($row && isset($row['location_id'])) {
				$locationId = $row['location_id'];
			}
		}

		//Setup the filtering and query variables
		$records = array();
		$searchQuery = request("query", "");
		$start = request("start", 0);
		$limit = request("limit", 10);
		$sort = array(
			'location_name_1 ASC'
		);
		$where = "1=1";
		$filter = json_decode(request("filter", json_encode(array())), true);
		$toTable = 'location_to_contact'; //Table to join with
		$toField = 'location_id'; //Field to join on
		$toKey = 'contact_id'; //Key of joining table
		$toId = intval(request("to_id", 0)); //id to filter joining table with
		$type = request('type', 'contact'); //Type of join we are doing

		$locationType = getParam('locationType');

		//Switch on the type
		switch ($type) {
			case "customer":
				$toTable = "customer_to_location";
				$toField = "location_id";
				$toKey = "customer_id";
				break;

			case "carrier":
				$toTable = "location_to_carriers";
				$toField = "location_id";
				$toKey = "carrier_id";
				break;
		}

		//Create all the fields
		$fields = array(
			'location.location_id',
			'location.location_abbr',
			'location.location_name_1',
			'location.location_name_2',
			'location.address_1',
			'location.address_2',
			'location.address_3',
			'location.zip',
			'uszip.City city',
			'uszip.State state',
			'uszip.Lat lat',
			'uszip.Long lng',
		);
		$fields = implode(', ', $fields);

		//create the from
		$from = "location_base location
			LEFT JOIN
				$toTable location_to
			ON
				location.location_id = location_to.$toField
			LEFT JOIN 
				ContractManager.dbo.ZipsPostalCodesUS uszip 
			ON 
				(uszip.Zip = location.zip AND uszip.Seq = location.seq)
			LEFT JOIN 
				ContractManager.dbo.ZipsPostalCodesCAN canzip 
			ON 
				(canzip.Zip = location.zip AND canzip.Seq = location.seq)";

		//Process the sort
		if (isset($_REQUEST['sort'])) {
			$sort = array();
			$sortArray = json_decode($_REQUEST['sort'], true);
			foreach ($sortArray as $sortItem) {
				$sort[] = $sortItem['property'] . " " . $sortItem['direction'];
			}
		}

		//Build the order/sort
		if (count($sort)) {
			$sort = implode(",\n", $sort);
		}
		else {
			$sort = '';
		}

		//Build the where
		if ($toId) {
			$where .= " AND location_to.$toKey = '$toId'";
		}

		if ($locationId) {
			$where .= " AND location.location_id = '$locationId'";
		}
		else if (is_string($searchQuery) && strlen($searchQuery)) {
			$where .= $this->getLocationSearchQueryWhere($searchQuery);
		}

		// Filter by location type
		if ($locationType) {
			if ($locationType == 'Billing') {
				$from .= " LEFT JOIN location_types ON location_types.location_type_id = location.type ";
				$where .= " AND location_types.name IN('Billing', 'Shipping/Billing') ";
			}
		}

		//Get the total
		$query = "SELECT COUNT(*) total FROM $from WHERE $where";
		$rows = LP_Db::fetchAll($query);
		foreach ($rows as $row) {
			$this->setParam("total", $row['total']);
		}

		//Run the query and get the results
		$query = "SELECT $fields FROM $from WHERE $where";
		$this->setParam('q', $query);
		$query = LP_Util::buildQuery($query, $sort, $limit, $start);
		$rows = LP_Db::fetchAll($query);

		// Keep track of which cities. If there are two locations in the same city
		// we need to show the location_name_2
		$cities = array();
		foreach ($rows as $row) {
			if (isset($cities[$row['city']])) {
				$cities[$row['city']]++;
			}
			else {
				$cities[$row['city']] = 1;
			}
		}

		foreach ($rows as $row) {
			//Add the row to the records
			if ($cities[$row['city']] > 1) {
				$row['location_display'] = $row['location_name_1'] . ' ' . $row['location_name_2'];
			}
			else {
				$row['location_display'] = $row['location_name_1'] . ' ' . $row['city'];
			}

			$records[] = $row;
		}

		//Add the records to the response
		$this->setParam("records", $records);
	}

	public function getLocationSearchQueryWhere($searchQuery, $where = '') {
		$wheres = array();

		//Search by location name
		$searchQuery = LP_Db::escape($searchQuery);
		$wheres[] = "location.location_name_1 LIKE '$searchQuery%'";
		$wheres[] = "location.location_name_2 LIKE '$searchQuery%'";

		//Search by address
		$wheres[] = "location.address_1 LIKE '$searchQuery%'";
		$wheres[] = "location.address_2 LIKE '$searchQuery%'";
		$wheres[] = "location.address_3 LIKE '$searchQuery%'";

		//Search by zip
		$wheres[] = "location.zip LIKE '$searchQuery%'";

		//Search by abbreviation
		$wheres[] = "location.location_abbr LIKE '$searchQuery%'";

		if (count($wheres)) {
			$where .= " AND " . $wheres[0];
			array_shift($wheres);
		}
		if (count($wheres) > 1) {
			$where .= " OR " . implode(" OR ", $wheres);
		}
		else if (count($wheres) == 1) {
			$where .= " OR " . array_shift($wheres);
		}

		return $where;
	}

}
