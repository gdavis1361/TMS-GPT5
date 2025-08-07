<?php
class League_SeasonController extends CrudController {
	public $model = 'LeagueSeason';
	public $primaryKey = 'season_id';
	
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
	
	public function formatRow($row) {
		$row['start_date'] = date('n/j/Y', strtotime($row['start_date']));
		$row['end_date'] = date('n/j/Y', strtotime($row['end_date']));
		return parent::formatRow($row);
	}
	
	public function standingsAction(){
		//Get the season
		$seasonId = request('season_id', 0);
		if(!$seasonId){
			$season = new LeagueSeason();
			$season->loadActiveSeason();
			$seasonId = $season->get('season_id');
		}
		
		$query = "SELECT
					game.*
					FROM
						league_season season
					LEFT JOIN
						league_week week
					ON
						week.season_id = season.season_id
					LEFT JOIN
						league_game game
					ON
						game.week_id = week.week_id
					WHERE
						season.season_id = '$seasonId'";
		$rows = LP_Db::fetchAll($query);
		
		//Build the data
		$teamMap = array();
		foreach ($rows as $row){
			//Make the entry for the team
			if(!isset ($teamMap[$row['home_team_id']])){
				$teamMap[$row['home_team_id']] = array(
					"wins" => 0,
					"losses" => 0,
					"team_id" => $row['home_team_id'],
					"points" => array()
				);
			}
			if(!isset ($teamMap[$row['away_team_id']])){
				$teamMap[$row['away_team_id']] = array(
					"wins" => 0,
					"losses" => 0,
					"team_id" => $row['away_team_id'],
					"points" => array()
				);
			}
			
			//Compute record
			if($row['winning_team_id']){
				$teamMap[$row['winning_team_id']]['wins']++;
			}
			if($row['losing_team_id']){
				$teamMap[$row['losing_team_id']]['losses']++;
			}
			
			//compute total points
			if($row['home_score']){
				$teamMap[$row['home_team_id']]['points'][] = $row['home_score'];
			}
			if($row['away_score']){
				$teamMap[$row['away_team_id']]['points'][] = $row['away_score'];
			}
		}
		
		//Compute the points
		foreach ($teamMap as &$data){
			if(count($data['points'])){
				$data['points'] = ceil(array_sum($data['points']) / count($data['points']));
			}
			else{
				$data['points'] = 0;
			}
		}
		
		//Sort the records by wins
		usort($teamMap, function($a, $b){
			if ($a['wins'] == $b['wins']) {
				return ($a['points'] >= $b['points']) ? -1 : 1;
			}
			return ($a['wins'] > $b['wins']) ? -1 : 1;
		});
		
		//Get the teams
		$records = array();
		foreach ($teamMap as $data){
			$team = new LeagueTeams($data['team_id']);
			$record = $team->get();
			$record['wins'] = $data['wins'];
			$record['losses'] = $data['losses'];
			$record['rank'] = count($records) + 1;
			$record['points'] = $data['points'];
			
			//Team pic
			if(!isset ($record['team_pic']) || !strlen($record['team_pic'])){
				$record['team_pic'] = "/resources/img/no-team.jpg";
			}
			else{
				$record['team_pic'] = "/resources/" . $record['team_pic'];
			}
			
			$records[] = $record;
		}
		$this->setParam('records', $records);
		
	}
}