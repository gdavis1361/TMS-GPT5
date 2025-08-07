<?php 
class LeagueSeason extends DBModel {
	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_season';
	
	public function insert($aData, $sTable = false) {
		
		//Ensure correct dates
		//$aData['start_date'] = date('Y-m-d 00:00:00', strtotime($aData['start_date']));
		//$aData['end_date'] = date('Y-m-d 00:00:00', strtotime($aData['end_date']));
		
		//Call the parent function
		$result = parent::insert($aData, $sTable);
		if(!$result){
			return $result;
		}
		
		//If the parent was successful run this
		$this->makeWeeks();
		$this->makeGames();
	}
	
	private function makeWeeks(){
		/**
		 * Start weeks on monday and end on friday
		 * Find the first monday of the season
		 * weeks do not have to be a full week
		 */
		
		//get the start and end dates of the season
		$startDate = strtotime($this->get('start_date'));
		$endDate = strtotime($this->get('end_date'));
		
		//Find the first monday of the season and make it the startDate
		if(date('w', $startDate) != 1){
			$startDate = strtotime('next monday', $startDate);
		}
		
		
		//Find how many weeks we can fit into this season
		$oneDay = 86400;
		$oneWeek = $oneDay * 7;
		$weeksInSeason = ceil(($endDate - $startDate) / $oneWeek);
		
		//Build the weeks
		for($i = 1; $i <= $weeksInSeason; $i++){
			
			//Calculate the start and end
			$weekStart = strtotime("+$i monday", $startDate);
			$weekEnd = strtotime("next sunday", $weekStart);
			
			//check if weekend is past the end date
			if($weekEnd > $endDate){
				$weekEnd = $endDate;
			}
			
			//Create the week
			$leageWeek = new LeagueWeek();
			$leageWeek->insert(array(
				"season_id" => $this->get('season_id'),
				"title" => "Week " . $i,
				"start_date" => date('l n/j/Y', $weekStart),
				"end_date" => date('l n/j/Y', $weekEnd)
			));
		}
	}
	
	public function makeGames(){
		/**
		 * Match up one team against another randomly, rotating home and away.
		 * If teams are uneven, last team unmatched will receive a bye.
		 * Keep track of what matchups have been made, do not schedule same matchup twice
		 * Ensure same amount of home and away games
		 */
		
		//Store the seasonId
		$seasonId = $this->get('season_id');
		
		//Get all the weeks
		$weeks = $this->getWeeks();
		$totalWeeks = count($weeks);
		
		//Get all teams
		$teams = $this->getTeams();
		$totalTeams = count($teams);
		
		//Determine if we need a bye team (team with id of 0)
		if($totalTeams % 2){
			$teams[] = array(
				'league_team_id' => 0
			);
		}
		$totalTeams = count($teams);
		
		//How many total games should we have totalTeams/2 * totalWeeks
		$totalGamesPerWeek = ceil($totalTeams/2);
		
		//Create a matchup matrix [home_id][away_id]
		$matchupMatrix = array();
		
		//Generate all games
		foreach($weeks as $week){
			$games = array();	//Array of games created
			$teamPool = array_merge(array(), $teams);	//Pool of teams to choose from

			while(count($games) < $totalGamesPerWeek){
				//Get the random index
				$homeIndex = rand(0, count($teamPool)-1);
				$awayIndex = rand(0, count($teamPool)-1);
				
				//If the indexes are the same just continue
				if($homeIndex == $awayIndex){
					continue;
				}
				
				//Get the teams
				$homeTeam = $teamPool[$homeIndex];
				$awayTeam = $teamPool[$awayIndex];
				$homeId = $homeTeam['league_team_id'];
				$awayId = $awayTeam['league_team_id'];
				
				//Check the matchup matrix to see if this matchup already exists
				if(!isset($matchupMatrix[$homeId])){
					$matchupMatrix[$homeId] = array();
				}
				if(!isset($matchupMatrix[$awayId])){
					$matchupMatrix[$awayId] = array();
				}
				if(isset($matchupMatrix[$homeId][$awayId]) || isset($matchupMatrix[$awayId][$homeId])){
					if(count($matchupMatrix) != $totalTeams){
						continue;
					}
				}
				
				//Matchup does not exist so create it
				if(!isset($matchupMatrix[$homeId][$awayId])){
					$matchupMatrix[$homeId][$awayId] = 0;
				}
				$matchupMatrix[$homeId][$awayId]++;
				$game = array(
					"week_id" => $week['week_id'],
					"home_team_id" => $homeId,
					"away_team_id" => $awayId,
					"winning_team_id" => 0,
					"losing_team_id" => 0
				);
				$games[] = $game;

				//Remove teams from team pool
				unset($teamPool[$homeIndex]);
				unset($teamPool[$awayIndex]);
				$teamPool = array_merge(array(), $teamPool);
				
				//Create the game
				$leagueGame = new LeagueGame();
				$leagueGame->insert($game);
			}
		}
	}
	
	public function getTeams(){
		$query = "SELECT * FROM league_teams";
		$result = $this->query($query);
		
		$teams = array();
		while ($row = $this->db->fetch_assoc($result) ) {
			$teams[] = $row;
		}
		return $teams;
	}
	
	public function getWeeks(){
		$seasonId = intval($this->get('season_id'));
		if (!$seasonId){
			return array();
		}
		
		$query = "SELECT * FROM league_week WHERE season_id = '$seasonId'";
		$result = $this->query($query);
		
		$weeks = array();
		while ($row = $this->db->fetch_assoc($result) ) {
			$weeks[] = $row;
		}
		return $weeks;
	}
	
	public function loadActiveSeason(){
		//Try to load the active season
		$today = date('Y-m-d 00:00:00');
		$query = "SELECT * FROM league_season WHERE start_date <= '$today' AND end_date >= '$today'";
		$row = LP_Db::fetchRow($query);
		if($row){
			$this->setArray($row);
		}
		else{
			$query = "SELECT TOP 1 * FROM league_season WHERE end_date >= '$today' ORDER BY end_date ASC";
			$row = LP_Db::fetchRow($query);
			$this->setArray($row);
		}
	}
}
?>