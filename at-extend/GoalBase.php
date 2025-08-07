<?php 
/**
 * @author Reid Workman
 */
 
class GoalBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'goal_base';

	public function create(	$nGoalPeriodId, $nUserId, $nGoalTypeId, $nGoalStatusId, 
							$nGoalValue, $nActualValue, $vActive, $nCreatedById ) {
		
		// Validate Data
		if ( !number( $nGoalPeriodId, TRUE ) ) die('You must provide a Goal Period Id');
		if ( !number( $nUserId, TRUE ) ) die('You must provide an User Id');
		if ( !number( $nGoalTypeId, TRUE ) ) die('You must provide a Goal Type Id');
		if ( !number( $nGoalStatusId, TRUE ) ) die('You must provide a Goal Status Id');
		if ( !number( $nGoalValue, TRUE ) ) die('You must provide a Goal Value (x.xx)');
		if ( !number( $nActualValue, TRUE ) ) die('You must provide an Actual Value (x.xx)');
		if ( !is_bool( $vActive ) ) die('Active flag must be a boolean');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'goal_period_id', $nGoalPeriodId );
		$this->set( 'user_id', $nUserId );
		$this->set( 'goal_type_id', $nGoalTypeId );
		$this->set( 'goal_status_id', $nGoalStatusId );
		$this->set( 'goal_value', $nGoalValue );
		$this->set( 'actual_value', $nActualValue );
		$this->set( 'active', $vActive );
		
		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>