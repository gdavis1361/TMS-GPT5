<?php
class League_GameController extends CrudController {
	public $model = 'LeagueGame';
	public $primaryKey = 'game_id';
	public $activeWeek;
	
	public function createAction() {
		if(get_user()->get('role_id') != UserRoles::Admin){
			return;
		}
		return parent::createAction();
	}
	
	public function updateAction() {
		if(get_user()->get('role_id') != UserRoles::Admin){
			return;
		}
		return parent::updateAction();
	}
	
	public function destroyAction() {
		if(get_user()->get('role_id') != UserRoles::Admin){
			return;
		}
		return parent::destroyAction();
	}
	
	public function getFields(){
		return array(
			"league_game.*",
			"home_team.team_name home_team_name",
			"away_team.team_name away_team_name",
			"home_team.team_pic home_team_pic",
			"away_team.team_pic away_team_pic",
		);
	}
	
	public function getJoin(){
		return array(
			"LEFT JOIN league_teams home_team ON home_team.league_team_id = league_game.home_team_id",
			"LEFT JOIN league_teams away_team ON away_team.league_team_id = league_game.away_team_id"
		);
	}
	
	public function getWhere(){
		$where = parent::getWhere();
		
		if(isset($_REQUEST['active'])){
			$week = new LeagueWeek();
			$week->loadActiveWeek();
			$this->activeWeek = $week;

			if($week->get('week_id')){
				$where[] = "week_id = {$week->get('week_id')}";
			}
		}
		return $where;
	}
	
	public function applyFilter($filter){
		$where = array();
		foreach ($filter as $filterObject){
			$value = LP_Db::escape($filterObject['value']);
			if($filterObject['property'] == "team_id"){
				$where[] = "(home_team_id = $value OR away_team_id = $value)";
			}
			else{
				$where[] =  "{$filterObject['property']} = $value";
			}
		}
		return $where;
	}
	
	public function formatRow($row) {
		if(!strlen($row['home_team_pic'])){
			$row['home_team_pic'] = "/resources/img/no-team.jpg";
		}
		else{
			$row['home_team_pic'] = "/resources/" . $row['home_team_pic'];
		}
		
		if(!strlen($row['away_team_pic'])){
			$row['away_team_pic'] = "/resources/img/no-team.jpg";
		}
		else{
			$row['away_team_pic'] = "/resources/" . $row['away_team_pic'];
		}
		return parent::formatRow($row);
	}
	
	/**
	 *	Get all the details of a single game
	 */
	public function detailsAction(){
		/**
		 *	What do we need?
		 *	- The game week dates
		 *	- team members from each team
		 *	- Stats from each day of the week for each team member
		 *	- Teams information
		 *	- Teams Records
		 *	- Teams image
		 *	- home_team
		 *		- team_name
		 *		- team_pic
		 *		- wins
		 *		- losses
		 *		- members
		 *			- image
		 *			- name
		 *			- stats
		 *				- date
		 *				- value
		 */
		
		//Create the record to return
		$record = array();
		
		//Get the game
		$gameId = intval(request("game_id"));
		$game = new LeagueGame($gameId);
		
		//Get the week
		$week = new LeagueWeek($game->get('week_id'));
		
		//Get the season
		$season = new LeagueSeason($week->get('season_id'));
		
		//Create the dates array
		$dates = array();
		$startDate = strtotime("-1 day", strtotime($week->get('start_date')));
		$endDate = strtotime($week->get('end_date'));
		while($startDate < $endDate){
			$dates[] = array("date" => date('Y-m-d 00:00:00', strtotime('+1 day', $startDate)));
			$startDate = strtotime("+1 day", $startDate);
		}
		
		//get the teams
		$homeTeam = new LeagueTeams($game->get('home_team_id'));
		//$homeTeam = new LeagueTeams(459);
		$homeTeamMembers = $homeTeam->getMembers();
		$homeRecord = $game->getHomeTeamRecord($season);
		
		$awayTeam = new LeagueTeams($game->get('away_team_id'));
		$awayTeamMembers = $awayTeam->getMembers();
		$awayRecord = $game->getAwayTeamRecord($season);
		
		
		//Get the stats for each team member
		foreach ($homeTeamMembers as &$member){
			$member['stats'] = $this->calculateMemberStats($member, $week);	
		}
		
		foreach ($awayTeamMembers as &$member){
			$member['stats'] = $this->calculateMemberStats($member, $week);	
		}
		
		//Combine all data into the record
		$record = array_merge($record, $game->get());
		$record['dates'] = $dates;
		$record['home_team'] = $homeTeam->get();
		$record['home_team']['members'] = $homeTeamMembers;
		$record['home_team']['record'] = $homeRecord;
		$record['away_team'] = $awayTeam->get();
		$record['away_team']['members'] = $awayTeamMembers;
		$record['away_team']['record'] = $awayRecord;
		
		//Team images
		$record['home_team']['team_pic'] = $homeTeam->getImage();
		$record['away_team']['team_pic'] = $awayTeam->getImage();
		
		$this->setParam('record', $record);
		
	}
	
	private function calculateMemberStats($member, $week){
		//Create the stats array
		$stats = array();
		$startDate = strtotime("-1 day", strtotime($week->get('start_date')));
		$endDate = strtotime($week->get('end_date'));
		while($startDate < $endDate){
			$stats[date('Y-m-d 00:00:00', strtotime('+1 day', $startDate))] = 0;
			$startDate = strtotime("+1 day", $startDate);
		}

		$query = "SELECT
					*
					FROM
						league_stats stats
					LEFT JOIN
						league_dates dates
					ON 
						dates.date_id = stats.date_id
					WHERE
						stats.user_id = '{$member['user_id']}'
					AND
						dates.league_date BETWEEN '{$week->get('start_date')}' AND '{$week->get('end_date')}'";
		$rows = LP_Db::fetchAll($query);
		foreach($rows as $row){
			$stats[date('Y-m-d 00:00:00', strtotime($row['league_date']))] = $row['points'];
		}
		
		//Loop through stats and make the real stats
		$realStats = array();
		foreach ($stats as $date => $value){
			$realStats[] = array(
				"date" => date('n/j/Y', strtotime($date)),
				"value" => $value
			);
		}
		
		return $realStats;
	}
}