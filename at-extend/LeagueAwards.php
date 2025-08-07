<?php 

/**
 * League Awards
 *
 * @author Steve Keylon
 */

class LeagueAwards extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_awards';

	public function create( $sDescription, $sName, $sPic, $nCreatedById ) {
		if ( !is_string($sDescription) ) return FALSE;
		if ( !is_string($sName) ) return FALSE;
		if ( !is_string($sPic) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		$this->set_award_desc($sDescription);
		$this->set_award_name($sName);
		$this->set_award_pic($sPic);
		$this->set_created_by_id($nCreatedById);
		$this->set_created_at(time());
		
		return $this->save();
	}
}
?>