<?php 
class LeagueGame extends DBModel {
	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_game';
	
	public function getHomeTeam($teamId){
		if($teamId == null){
			$teamId = $this->get('home_team_id');
		}
		$teamId = intval($teamId);
		return LP_Db::fetchRow("SELECT * FROM league_teams WHERE league_team_id = $teamId");
	}
	
	public function getAwayTeam($teamId){
		if($teamId == null){
			$teamId = $this->get('away_team_id');
		}
		$teamId = intval($teamId);
		return LP_Db::fetchRow("SELECT * FROM league_teams WHERE league_team_id = $teamId");
	}
	
	public function getHomeScore($week){
		$startDate = $week->get('start_date');
		$endDate = $week->get('end_date');
		$query = "SELECT 
					TOP 1
					AVG(stats.points) score
					FROM 
						league_stats stats
					LEFT JOIN
						league_dates dates
					ON
						dates.date_id = stats.date_id
					WHERE 
						league_team_id = '{$this->get('home_team_id')}'
					AND 
						dates.league_date BETWEEN '$startDate' AND '$endDate'
					AND stats.points <> 0";
		$row = LP_Db::fetchRow($query);
		if($row){
			return ceil($row['score']);
		}
		return 0;
	}
	public function getAwayScore($week){
		$startDate = $week->get('start_date');
		$endDate = $week->get('end_date');
		$query = "SELECT 
					TOP 1
					AVG(stats.points) score
					FROM 
						league_stats stats
					LEFT JOIN
						league_dates dates
					ON
						dates.date_id = stats.date_id
					WHERE 
						league_team_id = '{$this->get('away_team_id')}'
					AND 
						dates.league_date BETWEEN '$startDate' AND '$endDate'
					AND stats.points <> 0";
		$row = LP_Db::fetchRow($query);
		if($row){
			return ceil($row['score']);
		}
		return 0;
	}
	
	public function getHomeTeamRecord($season){
		$record = array();
		$query = "SELECT 
					COUNT(*) count
					FROM
						league_game
					LEFT JOIN
						league_week
					ON
						league_week.week_id = league_game.game_id
					WHERE 
						winning_team_id = {$this->get('home_team_id')}
					AND
						league_week.season_id = '{$season->get('season_id')}'";
		$row = LP_Db::fetchRow($query);
		$record['wins'] = $row['count'];
		
		$query = "SELECT 
					COUNT(*) count
					FROM
						league_game
					LEFT JOIN
						league_week
					ON
						league_week.week_id = league_game.game_id
					WHERE 
						losing_team_id = {$this->get('home_team_id')}
					AND
						league_week.season_id = '{$season->get('season_id')}'";
		$row = LP_Db::fetchRow($query);
		$record['losses'] = $row['count'];
		
		return $record;
	}
	public function getAwayTeamRecord($season){
		$record = array();
		$query = "SELECT 
					COUNT(*) count
					FROM
						league_game
					LEFT JOIN
						league_week
					ON
						league_week.week_id = league_game.game_id
					WHERE 
						winning_team_id = {$this->get('away_team_id')}
					AND
						league_week.season_id = '{$season->get('season_id')}'";
		$row = LP_Db::fetchRow($query);
		$record['wins'] = $row['count'];
		
		$query = "SELECT 
					COUNT(*) count
					FROM
						league_game
					LEFT JOIN
						league_week
					ON
						league_week.week_id = league_game.game_id
					WHERE 
						losing_team_id = {$this->get('away_team_id')}
					AND
						league_week.season_id = '{$season->get('season_id')}'";
		$row = LP_Db::fetchRow($query);
		$record['losses'] = $row['count'];
		return $record;
	}
	
	/**
	 * Updates the games data when the league stats table changes
	 * @param String $name
	 * @param LeagueStats $stats 
	 */
	public static function updateData($name, $stats){
		//Get the team
		$teamId = $stats->get('league_team_id');

		//Get the date
		$leagueDate = new LeagueDates($stats->get('date_id'));

		//Get all games within this date range
		$query = "SELECT
					league_game.*
					FROM
						league_week
					LEFT JOIN
						league_game
					ON
						league_game.week_id = league_week.week_id
					WHERE 
						league_week.start_date <= '{$leagueDate->get('league_date')}'
					AND 
						league_week.end_date >= '{$leagueDate->get('league_date')}'
					AND
						(league_game.home_team_id = '$teamId' OR league_game.away_team_id = '$teamId')";
		$rows = LP_Db::fetchAll($query);
		
		//Loop through these games and update the data
		foreach ($rows as $row){
			$leagueGame = new LeagueGame($row['game_id']);
			$leagueWeek = new LeagueWeek($row['week_id']);
			if($row['home_team_id'] == $teamId){
				$score = $leagueGame->getHomeScore($leagueWeek);
				$leagueGame->set('home_score', $score);
			}
			else{
				$score = $leagueGame->getAwayScore($leagueWeek);
				$leagueGame->set('away_score', $score);
			}
			
			//Save the game
			$leagueGame->save();
		}
	}
	
	/**
	 * Determine the winners and losers for any games ending on the previous day
	 * @param type $event 
	 */
	public static function generateStats($event){
		//Get the date
		$date = date('Y-m-d 00:00:00');
		if(isset ($_REQUEST['date'])){
			$date = date('Y-m-d 00:00:00', strtotime($_REQUEST['date']));
		}
		
		//Find any games with dates ending on previous days date
		$previousDate = date('Y-m-d 00:00:00', strtotime("-1 day", strtotime($date)));
		$query = "SELECT
					*
					FROM
						league_week
					LEFT JOIN
						league_game
					ON
						league_game.week_id = league_week.week_id
					WHERE
						league_week.end_date = '$previousDate'";
		$rows = LP_Db::fetchAll($query);
		
		//Set the winning/losing team for each game
		foreach ($rows as $row){
			$leagueGame = new LeagueGame($row['game_id']);
			
			//Set the winning team
			if(intval($leagueGame->get('home_score')) > $leagueGame->get('away_score')){
				$leagueGame->set('winning_team_id', $leagueGame->get('home_team_id'));
				$leagueGame->set('losing_team_id', $leagueGame->get('away_team_id'));
			}
			else if (intval($leagueGame->get('home_score')) < $leagueGame->get('away_score')){
				$leagueGame->set('winning_team_id', $leagueGame->get('away_team_id'));
				$leagueGame->set('losing_team_id', $leagueGame->get('home_team_id'));
			}
			else{
				$leagueGame->set('winning_team_id', 0);
				$leagueGame->set('losing_team_id', 0);
			}
			
			$leagueGame->save();
		}
	}
}
?>