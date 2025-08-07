<?php
class League_TeamController extends CrudController {
	public $model = 'LeagueTeams';
	public $primaryKey = 'league_team_id';
	
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
		if(!strlen($row['team_pic'])){
			$row['team_pic'] = "/resources/img/no-team.jpg";
		}
		else{
			$row['team_pic'] = "/resources/" . $row['team_pic'];
		}
		return parent::formatRow($row);
	}
	
	/**
	 *	Get all the details of a single team
	 */
	public function detailsAction(){
		$record = array();
		
		//Get the team
		$leagueTeamId = intval(request("league_team_id"));
		$team = new LeagueTeams($leagueTeamId);
		
		//get the team members
		$members = $team->getMembers();
		
		//Get the members rank
		$userIds = array();
		foreach ($members as $member){
			$userIds[] = $member['user_id'];
		}
		$userIdsSql = implode(', ', $userIds);
		$query = "WITH Stats AS (
					SELECT 
						users.*,
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
					) SELECT * FROM RankedStats WHERE user_id IN ($userIdsSql)";
		$rows = LP_Db::fetchAll($query);
		
		//Create a user rank map
		$rankMap = array();
		foreach ($rows as $row){
			$rankMap[$row['user_id']] = $row['rank'];
		}
		
		//Combine the rank with the user
		foreach ($members as &$member){
			$member['rank'] = $rankMap[$member['user_id']];
			$member['created_at'] = date('n/j/Y', strtotime($member['created_at']));
		}
		
		
		//Get the schedule of the current/last season
		$today = date('Y-m-d 00:00:00');
		$season = new LeagueSeason();
		$season->loadActiveSeason();
		$query = "SELECT
					game.*,
					week.title,
					week.start_date,
					week.end_date,
					home_team.team_name home_team_name,
					away_team.team_name away_team_name
					FROM
						league_week week
					LEFT JOIN
						league_game game
					ON
						game.week_id = week.week_id
					LEFT JOIN
						league_teams home_team
					ON
						home_team.league_team_id = game.home_team_id
					LEFT JOIN
						league_teams away_team
					ON
						away_team.league_team_id = game.away_team_id
					WHERE
						week.season_id = '{$season->get('season_id')}'
					AND
						(game.home_team_id = '$leagueTeamId' OR game.away_team_id = '$leagueTeamId')";
		$schedule = LP_Db::fetchAll($query);
		foreach ($schedule as &$game){
			 $game['start_date'] = date('n/j/Y', strtotime($game['start_date']));
			 $game['end_date'] = date('n/j/Y', strtotime($game['end_date']));
		}
		
		//Combine all data into the record
		$record = array_merge($record, $team->get());
		$record['members'] = $members;
		$record['schedule'] = $schedule;
		
		//Return the record
		$this->setParam('record', $this->formatRow($record));
		
	}
}