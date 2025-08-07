<?php
class Stats_UserController extends AjaxController {
	
	public function infoAction(){
		//Process and add the user information
		$userId = request("userId", get_user_id());
		$today = date('m/d/Y');
		$lastWeek = date('m/d/Y', strtotime("last week"));
		
		//Get user rank for the week
		$query = "WITH Stats AS (
					SELECT 
						users.user_id,
						(SELECT 
							AVG(stats.points)
							FROM 
								league_stats stats
							LEFT JOIN
								league_dates dates
							ON
								dates.date_id = stats.date_id
							WHERE 
								stats.user_id = users.user_id
							AND 
								dates.league_date BETWEEN '$lastWeek' AND '$today'
							GROUP BY stats.user_id
						) value
						FROM 
							user_base users
						LEFT JOIN
							contact_base contacts
						ON
							contacts.contact_id = users.contact_id
					),
					RankedStats AS (
						SELECT *, RANK() OVER (ORDER BY value DESC) rank FROM Stats
					) SELECT TOP 1 rank, value, (SELECT COUNT(*) count FROM Stats) total FROM RankedStats WHERE user_id = '$userId'";
		$rankRow = LP_Db::fetchRow($query);
		
		$query = "SELECT
					TOP 1
					users.user_id id,
					users.image image,
					(contacts.first_name + ' ' + contacts.last_name) name,
					user_branches.branch_name,
					league_teams.team_name
					FROM
						user_base users
					LEFT JOIN
						contact_base contacts
					ON
						contacts.contact_id = users.contact_id
					LEFT JOIN
						user_employee_to_branch
					ON
						users.user_id = user_employee_to_branch.user_id
					LEFT JOIN
						user_branches
					ON 
						user_employee_to_branch.branch_id = user_branches.branch_id
					LEFT JOIN
						user_employee_to_team
					ON 
						user_employee_to_team.user_id = users.user_id
					LEFT JOIN 
						league_teams
					ON 
						league_teams.league_team_id = user_employee_to_team.team_id
					WHERE
						users.user_id = '$userId'";
		$row = LP_Db::fetchRow($query);
		if($row){
			if(!strlen($row['image'])){
				$row['image'] = 'noimage.png';
			}
			$row['image'] = "/resources/" . $row['image'];
			$row['rank'] = $rankRow['rank'];
			$row['points'] = ceil($rankRow['value']);
			$row['total'] = $rankRow['total'];
		}
		$this->setParam("record", $row);
	}
	
	public function listAction(){
		$records = array();
		$searchQuery = request("query", "");
		$where = "1=1";
		$sort = "name ASC";
		$start = request("start", 0);
		$limit = request("limit", 10);
		$userId = intval(request('userId', 0));
		
		//Create all the fields
		$fields = array(
			'users.user_id id',
			'users.image image',
			'(contact.first_name + \' \' + contact.last_name) name'
		);
		$fields = implode(', ', $fields);
		
		//create the from
		$from = "user_base users
			LEFT JOIN
				contact_base contact
			ON
				contact.contact_id = users.contact_id";
		
		//Build the where
		if(strlen($searchQuery)){
			$searchParts = explode(" ", $searchQuery);
			if(count($searchParts) == 2){
				$where .= " AND contact.first_name LIKE '{$searchParts[0]}%'";
				$where .= " AND contact.last_name LIKE '{$searchParts[1]}%'";
			}
			else{
				$where .= " AND contact.first_name LIKE '$searchQuery%' OR contact.last_name LIKE '$searchQuery%'";
			}
		}
		//If there is a userId set
		if(intval($userId)){
			$where .= " AND users.user_id = '$userId'";
		}
		
		//get the total
		$query = "SELECT COUNT(*) total FROM $from WHERE $where";
		$row = LP_Db::fetchRow($query);
		if($row){
			$this->setParam("total", $row['total']);
		}
		
		//Get the records
		$query = "SELECT
						$fields
					FROM
						$from
					WHERE
						$where";
		$query = LP_Util::buildQuery($query, $sort, $limit, $start);
		$rows = LP_Db::fetchAll($query);
		foreach($rows as $row){
			//Process the image
			if(!strlen($row['image'])){
				$row['image'] = 'noimage.png';
			}
			$row['image'] = "/resources/" . $row['image'];
			
			$records[] = $row;
		}
		$this->setParam("records", $records);
	}
	
	public function statsAction() {
		//Process and add the user information
		$userId = request("userId", get_user_id());
		$query = "SELECT
					TOP 1
					users.user_id id,
					users.image image,
					(contacts.first_name + ' ' + contacts.last_name) name,
					user_branches.branch_name,
					league_teams.team_name
					FROM
						user_base users
					LEFT JOIN
						contact_base contacts
					ON
						contacts.contact_id = users.contact_id
					LEFT JOIN
						user_employee_to_branch
					ON
						users.user_id = user_employee_to_branch.user_id
					LEFT JOIN
						user_branches
					ON 
						user_employee_to_branch.branch_id = user_branches.branch_id
					LEFT JOIN
						user_employee_to_team
					ON 
						user_employee_to_team.user_id = users.user_id
					LEFT JOIN 
						league_teams
					ON 
						league_teams.league_team_id = user_employee_to_team.team_id
					WHERE
						users.user_id = '$userId'";
		$row = LP_Db::fetchRow($query);
		if($row){
			if(!strlen($row['image'])){
				$row['image'] = 'noimage.png';
			}
			$row['image'] = "/resources/" . $row['image'];
			$this->setParam("user", $row);
		}
		
		//Set up the query vars
		$records = array();
		$startDate = date('m/d/Y', strtotime("last week"));
		$stopDate = date('m/d/Y');
		$where = "1=1 AND stats.user_id = '$userId'";
		$direction = '';
		$order = array();
		$groups = array();
		$fields = array();
		$type = request("type", "points");
		$typeName = request("typeName", "Points");
		$groupType = "day";
		
		//Process any filters
		if(isset($_GET['startDate'])){
			$startDate = date('m/d/Y', strtotime($_GET['startDate']));
		}
		if(isset($_GET['stopDate'])){
			$stopDate = date('m/d/Y', strtotime($_GET['stopDate']));
		}
		$where .= " AND dates.league_date BETWEEN '$startDate' AND '$stopDate'";
		$oneMonth = 60*60*24*31;
		if((strtotime($stopDate) - strtotime($startDate)) > $oneMonth){
			$fields[] = 'YEAR(dates.league_date) year';
			$fields[] = 'MONTH(dates.league_date) month';
			$fields[] = "AVG(stats.$type) value";
			$groups[] = 'YEAR(dates.league_date)';
			$groups[] = 'MONTH(dates.league_date)';
			$order[] = 'YEAR(dates.league_date)';
			$order[] = 'MONTH(dates.league_date)';
			$groupType = "month";
			
		}
		else{
			$fields[] = "CONVERT(VARCHAR, dates.league_date, 107) date";
			$fields[] = "stats.$type value";
			$order[] = 'dates.league_date';
		}
		
		//Compile the fields, groups
		$fields = implode(', ', $fields);
		
		//Build the query
		$query = "SELECT 
					$fields
					FROM
						league_stats stats
					LEFT JOIN 
						league_dates dates
					ON 
						dates.date_id = stats.date_id
					WHERE 
						$where";
		
		//Add the group if necessary
		if(count($groups)){
			$groups = implode(', ', $groups);
			$query .= " GROUP BY $groups";
		}
		
		//Add the order by
		if(count($order)){
			$order = implode(', ', $order);
			$query .= " ORDER BY $order $direction";
		}
		
		$rows = LP_Db::fetchAll($query);
		foreach($rows as $row){
			//Convert the date depending on date type
			if(isset($row['date'])){
				$row['date'] = date('F j, Y', strtotime($row['date']));
			}
			if(isset($row['year']) && isset($row['month'])){
				$row['date'] = date('F Y', strtotime($row['month'] . "/1/" . $row['year']));
			}
			
			//Process the value
			$row['value'] = intval(floor($row['value']));
			
			//Set the type
			$row['type'] = $typeName;
			
			//Set the group type
			$row['group'] = $groupType;
			
			//Add the row to the records
			$records[] = $row;
		}
		if(count($records) < 2){
			$records = array();
		}
		$this->setParam('records', $records);
	}
	
	public function gridAction(){
		$userId = request("userId", get_user_id());
		$records = array();
		$date = date('m/d/Y', strtotime(request("date", date('m/d/Y'))));
		$startDate = date('m/d/Y', strtotime(request("startDate", date('m/d/Y', strtotime("last week")))));
		$stopDate = date('m/d/Y', strtotime(request("stopDate", date('m/d/Y'))));
		$group = request("group", "day");
		$where = "1=1 AND stats.user_id = '$userId'";
		$fields = array();
		$groups = array();
		$order = array();
		
		//Apply any filters
		switch($group){
			case 'day':
				
				//Set the date param
				$this->setParam("date", date('F j, Y', strtotime($date)));
				
				//Add the fields
				$fields = array_merge($fields, array(
					"points",
					"total_contacts",
					"up_to_date_contacts",
					"up_to_date_pct",
					"call_interval_avg",
					"revenue",
					"margin",
					"margin_pct"
				));
				
				//Add the where
				$where .= " AND dates.league_date BETWEEN '$startDate' AND '$stopDate'";
				
			break;
		
			case 'month':
				//Set the date param
				$this->setParam("date", date('F Y', strtotime($date)));
				
				//Create the fields
				$fields = array_merge($fields, array(
					"YEAR(dates.league_date) year",
					"MONTH(dates.league_date) month",
					"AVG(points) points",
					"AVG(total_contacts) total_contacts",
					"AVG(up_to_date_contacts) up_to_date_contacts",
					"AVG(up_to_date_pct) up_to_date_pct",
					"AVG(call_interval_avg) call_interval_avg",
					"AVG(revenue) revenue",
					"AVG(margin) margin",
					"AVG(margin_pct) margin_pct"
				));
				
				//Create the groups
				$groups = array_merge($groups, array(
					"YEAR(dates.league_date)",
					"MONTH(dates.league_date)"
				));
				
				//Create the order
				$order = array_merge($order, array(
					"YEAR(dates.league_date)",
					"MONTH(dates.league_date)"
				));
				
				//Create the between where
				$firstDayOfMonth = $date;
				$lastDayOfMonth = date('m/d/Y', strtotime("+1 month", strtotime($firstDayOfMonth)));
				$where .= " AND dates.league_date BETWEEN '$firstDayOfMonth' AND '$lastDayOfMonth'";
			break;
		}
		
		//Compile the fields
		$fields = implode(", ", $fields);
		
		//Get the requested date
		$query = "SELECT
					TOP 1
					$fields
					FROM
						league_stats stats
					LEFT JOIN
						league_dates dates
					ON
						dates.date_id = stats.date_id
					WHERE 
						$where";
		//Add the group if necessary
		if(count($groups)){
			$groups = implode(', ', $groups);
			$query .= " GROUP BY $groups";
		}
		
		//Add the order by
		if(count($order)){
			$order = implode(', ', $order);
			$query .= " ORDER BY $order";
		}

		$row = LP_Db::fetchRow($query);
		if(!$row){
			return false;
		}

		//title => field
		$rowMap = array(
			"Total Points" => "points",
			"Total Contacts" => "total_contacts",
			"Up To Date Contacts" => "up_to_date_contacts",
			"Up To Date Contacts (%)" => "up_to_date_pct",
			"Average Call Interval" => "call_interval_avg",
			"Revenue" => "revenue",
			"Margin" => "margin",
			"Margin (%)" => "margin_pct",
		);

		foreach ($rowMap as $name => $value){
			//Create the record
			$records[] = array(
				"name" => $name,
				"value" => $row[$value]
			);
		}
		$this->setParam('records', $records);
		
	}
	
	public function compareAction(){
		//Set up the query vars
		$userId = request("userId", get_user_id());
		$records = array();
		$startDate = date('m/d/Y', strtotime(request("startDate", date('m/d/Y', strtotime("last week")))));
		$stopDate = date('m/d/Y', strtotime(request("stopDate", date('m/d/Y'))));
		$where = "1=1 AND stats.user_id = '$userId'";
		$direction = '';
		$order = array();
		$groups = array();
		$fields = array();
		$type = request("type", "points");
		$typeName = request("typeName", "Points");
		
		
		//Process any filters
		$where .= " AND dates.league_date BETWEEN '$startDate' AND '$stopDate'";
		$oneMonth = 60*60*24*31;
		
//		if((strtotime($stopDate) - strtotime($startDate)) > $oneMonth){
//			$fields = array_merge($fields, array(
//				"YEAR(dates.league_date) year",
//				"MONTH(dates.league_date) month",
//				"AVG(stats.$type) value",
//			));
//			
//			$groups = array_merge($groups, array(
//				"YEAR(dates.league_date)",
//				"MONTH(dates.league_date)",
//				"stats.branch_id"
//			));
//			
//			$order = array_merge($order, array(
//				"YEAR(dates.league_date)",
//				"MONTH(dates.league_date)"
//			));
//		}
		//else{
			$fields = array_merge($fields, array(
				"CONVERT(VARCHAR, dates.league_date, 107) date",
				"stats.$type value"
			));
			$order[] = 'dates.league_date';
		//}
		
		//Compile the fields
		$fields = implode(", ", $fields);
		
		$query = "SELECT 
					$fields,
					stats.branch_id
					FROM
						league_stats stats
					LEFT JOIN 
						league_dates dates
					ON 
						dates.date_id = stats.date_id
					WHERE 
						$where";
		
		//Add the group if necessary
		if(count($groups)){
			$groups = implode(', ', $groups);
			$query .= " GROUP BY $groups";
		}
		
		//Add the order by
		if(count($order)){
			$order = implode(', ', $order);
			$query .= " ORDER BY $order";
		}
		$rows = LP_Db::fetchAll($query);
		foreach($rows as $row){
			//Convert the date depending on date type
			if(isset($row['date'])){
				$row['date'] = date('F j, Y', strtotime($row['date']));
			}
			if(isset($row['year']) && isset($row['month'])){
				$row['date'] = date('F Y', strtotime($row['month'] . "/1/" . $row['year']));
			}
			
			$row['value'] = intval($row['value']);
			$row['branch'] = $this->getBranchAverage($row, $type);
			$row['company'] = $this->getCompanyAverage($row, $type);
			$records[] = $row;
		}
		$this->setParam('records', $records);
	}
	
	public function getCompanyAverage($row, $type){
		$where = "1=1";
		$groups = array();
		$order = array();
		
		//Compute the date range
		if(isset($row['month']) && isset($row['year'])){
			$startDate = date('m/d/Y', strtotime($row['month'] . "/1/" . $row['year']));
			$stopDate = date('m/d/Y', strtotime("+1 month", strtotime($startDate)));
		}
		else{
			$startDate = date('m/j/Y', strtotime($row['date']));
			$stopDate = $startDate;
		}
		$where .= " AND dates.league_date BETWEEN '$startDate' AND '$stopDate'";
		
		$groups = array_merge($groups, array(
			"YEAR(dates.league_date)",
			"MONTH(dates.league_date)"
		));
		
		$order = array_merge($order, array(
			"YEAR(dates.league_date)",
			"MONTH(dates.league_date)"
		));
		
		$query = "SELECT
					TOP 1
					AVG(stats.$type) avg
					FROM
						league_stats stats
					LEFT JOIN
						league_dates dates
					ON
						dates.date_id = stats.date_id
					WHERE
						$where";
		//Add the group if necessary
		if(count($groups)){
			$groups = implode(', ', $groups);
			$query .= " GROUP BY $groups";
		}
		
		//Add the order by
		if(count($order)){
			$order = implode(', ', $order);
			$query .= " ORDER BY $order";
		}
		$row = LP_Db::fetchRow($query);
		if($row){
			return intval($row['avg']);
		}
		
		return 0;
	}
	
	public function getBranchAverage($row, $type){
		$where = "1=1";
		$groups = array();
		$order = array();
		
		//Compute the date range
		if(isset($row['month']) && isset($row['year'])){
			$startDate = date('m/d/Y', strtotime($row['month'] . "/1/" . $row['year']));
			$stopDate = date('m/d/Y', strtotime("+1 month", strtotime($startDate)));
		}
		else{
			$startDate = date('m/j/Y', strtotime($row['date']));
			$stopDate = $startDate;
		}
		$where .= " AND dates.league_date BETWEEN '$startDate' AND '$stopDate'";
		$where .= " AND stats.branch_id = '{$row['branch_id']}'";
		
		$groups = array_merge($groups, array(
			"YEAR(dates.league_date)",
			"MONTH(dates.league_date)"
		));
		
		$order = array_merge($order, array(
			"YEAR(dates.league_date)",
			"MONTH(dates.league_date)"
		));
		
		$query = "SELECT
					TOP 1
					AVG(stats.$type) avg
					FROM
						league_stats stats
					LEFT JOIN
						league_dates dates
					ON
						dates.date_id = stats.date_id
					WHERE
						$where";
		//Add the group if necessary
		if(count($groups)){
			$groups = implode(', ', $groups);
			$query .= " GROUP BY $groups";
		}
		
		//Add the order by
		if(count($order)){
			$order = implode(', ', $order);
			$query .= " ORDER BY $order";
		}
		$row = LP_Db::fetchRow($query);
		if($row){
			return intval($row['avg']);
		}
		
		return 0;
	}
}