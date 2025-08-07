<?php
class Stats_LeaderboardController extends AjaxController {
	
	public function individualAction(){
		$userId = get_user_id();
		$records = array();
		$startDate = date('m/d/Y', strtotime(request("startDate", date('m/d/Y', strtotime("last week")))));
		$stopDate = date('m/d/Y', strtotime(request("stopDate", date('m/d/Y'))));
		$start = 0;
		$limit = 5;
		$type = request('type', 'points');
		$sorters = json_decode(request('sort', '{}'), true);
		
		//Apply any filters
		if(isset($_GET['start'])){
			$start = intval($_GET['start']);
			if ($start < 0) {
				$start = 0;
			}
			$start += 1;
		}
		if(isset($_GET['limit'])){
			$limit = intval($_GET['limit']);
			if ($limit < 1) {
				$limit = 1;
			}
		}
		
		//Get the total
		$query = "SELECT 
					COUNT(*) count
					FROM 
						user_base users
					LEFT JOIN
						contact_base contacts
					ON
						contacts.contact_id = users.contact_id";
		$row = LP_Db::fetchRow($query);
		if($row){
			$this->setParam("total", $row['count']);
		}
		
		
		//Get the records
		$query = "WITH Stats AS (
					SELECT 
						(contacts.first_name + ' ' + contacts.last_name) name,
						users.image image,
						users.user_id,
						(SELECT 
							AVG(stats.$type)
							FROM 
								league_stats stats
							LEFT JOIN
								league_dates dates
							ON
								dates.date_id = stats.date_id
							WHERE 
								stats.user_id = users.user_id
							AND 
								dates.league_date BETWEEN '$startDate' AND '$stopDate'
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
					),
					LimitedStats AS (
						SELECT ROW_NUMBER() OVER (ORDER BY value DESC) AS ZEND_DB_ROWNUM, * FROM RankedStats
					)";
		//$query = LP_Util::buildQuery($query, "value DESC", $limit, $start);
		
		//If there is a start and limit
		if($start && $limit){
			$startRow = $start;
			$stopRow = $startRow + $limit - 1;
			$query .= " SELECT * FROM LimitedStats WHERE ZEND_DB_ROWNUM BETWEEN $startRow AND $stopRow";
		}
		else{
			$query .= " SELECT * FROM LimitedStats";
		}
		
		//Add the sort
		if(count($sorters)){
			$sort = array();
			foreach($sorters as $sorter){
				$sort[] = $sorter['property'] . ' ' . $sorter['direction'];
			}
			$query .= " ORDER BY " . implode(',', $sort);
		}
		
		$rows = LP_Db::fetchAll($query);
		foreach($rows as $row){
			$row['value'] = intval($row['value']);
			$row['url'] = '/mypage?id=' . $row['user_id'];
			if(!strlen($row['image'])){
				$row['image'] = "/resources/noimage.png";
			}
			else{
				$row['image'] = "/resources/" . $row['image'];
			}
			$records[] = $row;
		}
		
		if(isset ($_REQUEST['reverse'])){
			$records = array_reverse($records);
		}
		$this->setParam('records', $records);
	}
	
	public function teamAction() {
		$userId = get_user_id();
		$records = array();
		$startDate = date('m/d/Y', strtotime(request("startDate", date('m/d/Y', strtotime("last week")))));
		$stopDate = date('m/d/Y', strtotime(request("stopDate", date('m/d/Y'))));
		$start = 0;
		$limit = 5;
		$type = request('type', 'points');
		$sorters = json_decode(request('sort', '{}'), true);
		
		//Apply any filters
		if(isset($_GET['start'])){
			$start = intval($_GET['start']);
			if ($start < 0) {
				$start = 0;
			}
			$start += 1;
		}
		if(isset($_GET['limit'])){
			$limit = intval($_GET['limit']);
			if ($limit < 1) {
				$limit = 1;
			}
		}
		
		//Get the total
		$query = "SELECT 
					COUNT(*) count
					FROM 
						league_teams teams";
		$row = LP_Db::fetchRow($query);
		if($row){
			$this->setParam("total", $row['count']);
		}
		
		//Get the records
		$query = "WITH Stats AS 
					(SELECT 
						teams.team_name name,
						teams.team_pic image,
						teams.league_team_id,
						(SELECT 
							AVG(stats.$type)
							FROM 
								league_stats stats
							LEFT JOIN
								league_dates dates
							ON
								dates.date_id = stats.date_id
							WHERE 
								league_team_id = teams.league_team_id
							AND 
								dates.league_date BETWEEN '$startDate' AND '$stopDate'
						) value
						FROM 
							league_teams teams
					),
					RankedStats AS (
						SELECT *, RANK() OVER (ORDER BY value DESC) rank FROM Stats
					),
					LimitedStats AS (
						SELECT ROW_NUMBER() OVER (ORDER BY value DESC) AS ZEND_DB_ROWNUM, * FROM RankedStats
					)";
		//$query = LP_Util::buildQuery($query, "value DESC", $limit, $start);
		
		//If there is a start and limit
		if($start && $limit){
			$startRow = $start;
			$stopRow = $startRow + $limit - 1;
			$query .= " SELECT * FROM LimitedStats WHERE ZEND_DB_ROWNUM BETWEEN $startRow AND $stopRow";
		}
		else{
			$query .= " SELECT * FROM LimitedStats";
		}
		
		//Add the sort
		if(count($sorters)){
			$sort = array();
			foreach($sorters as $sorter){
				$sort[] = $sorter['property'] . ' ' . $sorter['direction'];
			}
			$query .= " ORDER BY " . implode(',', $sort);
		}
		
		$rows = LP_Db::fetchAll($query);
		foreach($rows as $row){
			$row['value'] = intval($row['value']);
			$row['url'] = '/mypage?section=teams&id=' . $row['league_team_id'];
			if(!strlen($row['image'])){
				$row['image'] = "/resources/img/no-team.jpg";
			}
			else{
				$row['image'] = "/resources/" . $row['image'];
			}
			$records[] = $row;
		}
		if(isset ($_REQUEST['reverse'])){
			$records = array_reverse($records);
		}
		$this->setParam("startDate", $startDate);
		$this->setParam("endDate", $stopDate);
		$this->setParam('records', $records);
	}
	
	public function branchAction(){
		$userId = get_user_id();
		$records = array();
		$startDate = date('m/d/Y', strtotime(request("startDate", date('m/d/Y', strtotime("last week")))));
		$stopDate = date('m/d/Y', strtotime(request("stopDate", date('m/d/Y'))));
		$start = 0;
		$limit = 5;
		$type = request('type', 'points');
		$sorters = json_decode(request('sort', '{}'), true);
		
		//Apply any filters
		if(isset($_GET['start'])){
			$start = intval($_GET['start']);
			if ($start < 0) {
				$start = 0;
			}
			$start += 1;
		}
		if(isset($_GET['limit'])){
			$limit = intval($_GET['limit']);
			if ($limit < 1) {
				$limit = 1;
			}
		}
		
		//Get the total
		$query = "SELECT 
					COUNT(*) count
					FROM 
						user_branches branches";
		$row = LP_Db::fetchRow($query);
		if($row){
			$this->setParam("total", $row['count']);
		}
		
		//Get the records
		$query = "WITH Stats AS (
					SELECT 
						branches.branch_name name,
						(SELECT 
							AVG(stats.$type)
							FROM 
								league_stats stats
							LEFT JOIN
								league_dates dates
							ON
								dates.date_id = stats.date_id
							WHERE 
								branch_id = branches.branch_id
							AND 
								dates.league_date BETWEEN '$startDate' AND '$stopDate'
						) value
						FROM 
							user_branches branches
					),
					RankedStats AS (
						SELECT *, RANK() OVER (ORDER BY value DESC) rank FROM Stats
					),
					LimitedStats AS (
						SELECT ROW_NUMBER() OVER (ORDER BY value DESC) AS ZEND_DB_ROWNUM, * FROM RankedStats
					)";
		//$query = LP_Util::buildQuery($query, "value DESC", $limit, $start);
		
		//If there is a start and limit
		if($start && $limit){
			$startRow = $start;
			$stopRow = $startRow + $limit - 1;
			$query .= " SELECT * FROM LimitedStats WHERE ZEND_DB_ROWNUM BETWEEN $startRow AND $stopRow";
		}
		else{
			$query .= " SELECT * FROM LimitedStats";
		}
		
		//Add the sort
		if(count($sorters)){
			$sort = array();
			foreach($sorters as $sorter){
				$sort[] = $sorter['property'] . ' ' . $sorter['direction'];
			}
			$query .= " ORDER BY " . implode(',', $sort);
		}
		
		$rows = LP_Db::fetchAll($query);
		foreach($rows as $row){
			$row['value'] = intval($row['value']);
			$row['image'] = "/resources/noimage.png";
			$records[] = $row;
		}
		if(isset ($_REQUEST['reverse'])){
			$records = array_reverse($records);
		}
		$this->setParam("startDate", $startDate);
		$this->setParam("endDate", $stopDate);
		$this->setParam('records', $records);
	}
}