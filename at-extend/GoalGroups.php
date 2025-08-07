<?php 
/**
 * @author Reid Workman
 */
 
class GoalGroups extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'goal_groups';

	public function create(	$sGroupName, $nGroupTypeId, $nCreatedById ) {
		
		// Prep Variables (trim and substr)
		$sGroupName = prep_var( $sGroupName, 50 );
		
		// Validate Data
		if ( !string( $sGroupName, TRUE ) ) die('You must provide a Group Name');
		if ( !number( $nGroupTypeId, TRUE ) ) die('You must provide a Group Type Id');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'group_name', $sGroupName );
		$this->set( 'group_type_id', $nGroupTypeId );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>