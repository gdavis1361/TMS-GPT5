<?php 
/**
 * Contact to Goals
 *
 * @author Steve Keylon
 */
 
class ContactToGoals extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_to_goals';

	public function create(	$nContactId, $nGoalId ) {
		// Validate Data
		if (!is_numeric($nGoalId) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_numeric($nContactId) ) { 
			//error 
			return FALSE; 
		}
		
		// Save Data
		$this->set_contact_id($nContactId);
		$this->set_goal_id($nGoalId);
		
		$this->save();
		
		// Report
		return ;
	}
}

?>