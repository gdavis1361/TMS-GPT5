<?php 

/**
 * League Awards Issued
 *
 * @author Steve Keylon
 */

class LeagueAwardsIssued extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_awards_issued';

	public function create( $nAwardId, $nUserId, $sAwardDate, $nPeriodId, $nCreatedById ) {
		if ( !is_numeric($nAwardId) ) return FALSE;
		if ( !is_numeric($nUserId) ) return FALSE;
		if ( !is_string($sAwardDate) ) return FALSE;
		if ( !is_numeric($nPeriodId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		$this->set_award_id($nAwardId);
		$this->set_user_id($nUserId);
		$this->set_award_date($sAwardDate);
		$this->set_award_period_id($nPeriodId);
		$this->set_created_by_id($nCreatedById);
		$this->set_created_at(time());
		
		return $this->save();
	}
}
?>