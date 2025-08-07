<?php 

/**
 * League Schedule
 *
 * @author Steve Keylon
 */

class LeagueSchedule extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_schedule';

	public function create( $nScheduleId, $nSeasonId, $nWeekIndex, $nTeamId, $nCreatedById ) {
		if ( !is_numeric($nScheduleId) ) return FALSE;
		if ( !is_numeric($nSeasonId) ) return FALSE;
		if ( !is_numeric($nWeekIndex) ) return FALSE;
		if ( !is_numeric($nTeamId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		$this->set_schedule_id($nScheduleId);
		$this->set_season_id($nSeasonId);
		$this->set_week_index($nWeekIndex);
		$this->set_team_id($nScheduleId);
		$this->set_created_by_id($nCreatedById);
		
		return $this->save();
	}
	
	function get_Team() {
		$o = new LeagueTeams();
		return $o->load( $this->get_team_id() );
	}
}
?>