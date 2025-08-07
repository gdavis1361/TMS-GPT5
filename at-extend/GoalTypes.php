<?php 
/**
 * @author Reid Workman
 */
 
class GoalTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'goal_types';

	public function create(	$sGoalTypeName, $nGoalTypeGroupId, $nUnitId, $nCreatedById ) {
		
		// Prep Variables (trim and substr)
		$sGoalTypeName = prep_var( $sGoalTypeName, 50 );
		
		// Validate Data
		if ( !string( $sGoalTypeName, TRUE ) ) die('You must provide a Goal Type Name');
		if ( !number( $nGoalTypeGroupId, TRUE ) ) die('You must provide a Goal Type Group Id');
		if ( !number( $nUnitId, TRUE ) ) die('You must provide a Unit Id');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'goal_type_name', $sGoalTypeName );
		$this->set( 'goal_type_group_id', $nGoalTypeGroupId );
		$this->set( 'unit_id', $nUnitId );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>