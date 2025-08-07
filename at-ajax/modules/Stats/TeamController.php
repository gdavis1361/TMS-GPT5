<?php

class Stats_TeamController extends AjaxController {

	public function listAction(){
		$records = array();
		$db = new DBModel();
		$db->connect();
		$query = "SELECT
						teams.league_team_id id,
						teams.team_name name
					FROM
						league_teams teams";
		$result = $db->db->query($query);
		while($row = $db->db->fetch_assoc($result)){
			$records[] = $row;
		}
		$this->setParam("records", $records);
	}
	
	public function gridAction() {
		$userId = get_user_id();
		$records = array();
		$db = new DBModel();
		$db->connect();
		$date = date('m/d/Y');
		$previousDate = date('m/d/y', strtotime("-1 day"));
		
		//Get the users branch id
		$userToBranch = new UserEmployeeToBranch();
		$userToBranch->load(array(
			"user_id" => $userId
		));
		$branchId = $userToBranch->get('branch_id');
		
		//get the users team id
		$userToTeam = new UserEmployeeToTeam();
		$teamId = $userToTeam->get_user_team($userId);


		//Apply any filters
		if (isset($_GET['date'])) {
			$date = date('m/d/Y', strtotime($_GET['date']));
			$previousDate = date('m/d/y', strtotime("-1 day"));
		}
		
		if(isset($_GET['teamId'])){
			$teamId = intval($_GET['teamId']);
		}

		//Get the requested date
		$query = "SELECT
					TOP 1
					AVG(points) points,
					AVG(total_contacts) total_contacts,
					AVG(up_to_date_contacts) up_to_date_contacts,
					AVG(up_to_date_pct) up_to_date_pct,
					AVG(call_interval_avg) call_interval_avg,
					AVG(revenue) revenue,
					AVG(margin) margin,
					AVG(margin_pct) margin_pct
					FROM 
						league_stats stats
					LEFT JOIN
						league_dates dates
					ON
						dates.date_id = stats.date_id
					LEFT JOIN
						league_teams teams
					ON 
						teams.league_team_id = stats.league_team_id
					WHERE 
						stats.league_team_id = '$teamId'
					AND
						dates.league_date = '$date'";
		$result = $db->db->query($query);
		$row = $db->db->fetch_assoc($result);

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

		foreach ($rowMap as $name => $value) {
			//Create the record
			$records[] = array(
				"name" => $name,
				"value" => $row[$value],
			);
		}

		$this->setParam('records', $records);
	}
}

	