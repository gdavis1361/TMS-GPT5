<?php 

/**
 * League Daily Score
 *
 * @author Steve Keylon
 */

class LeagueDailyScore extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_dail_score';

	public function create( $nScheduleId, $nTeamId, $nLeagueDateId, $nCreatedById ) {
		if ( !is_numeric($nScheduleId) ) return FALSE;
		if ( !is_numeric($nTeamId) ) return FALSE;
		if ( !is_numeric($nLeagueDateId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		$this->set_schedule_id($nScheduleId);
		$this->set_team_id($nTeamId);
		$this->set_league_date_id($nLeagueDateId);
		$this->set_created_by_id($nCreatedById);
		$this->set_created_at(time());
		
		return $this->save();
	}
	
	public function add_score($nAmount) {
		if ( !is_numeric($nAmount) ) return;
		$nScore = $this->get_Score();
		$this->set_score($nScore + $nAmount);
		$this->save();
	}
	
	public function subtract_score($nAmount) {
		if ( !is_numeric($nAmount) ) return;
		$nScore = $this->get_Score();
		$this->set_score($nScore - $nAmount);
		$this->save();
	}
	
	public function calculate_winner() {
		// check league schedule to see the teams playing on this schedule date to determine
		// opposing team, retrieve opposing team's score to declare a winner. 
	}
}
?>