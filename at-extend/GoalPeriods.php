<?php 
/**
 * @author Reid Workman
 */
 
class GoalPeriods extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'goal_periods';

	public function create(	$sGoalPeriodName, $sGoalPeriodDescription, 
							$nStartDate, $nEndDate, $nCreatedById ) {
		
		// Prep Variables (trim and substr)
		$sGoalPeriodName = prep_var( $sGoalPeriodName, 50 );
		$sGoalPeriodDescription = prep_var( $sGoalPeriodDescription );
		
		// Validate Data
		if ( !string( $sGoalPeriodName, TRUE ) ) die('You must provide a Goal Period Name');
		if ( !string( $sGoalPeriodDescription ) ) die('Goal Period Description must be a string');
		if ( !number( $nStartDate, TRUE ) ) die('You must provide a Goal Period Start Date');
		if ( !number( $nEndDate, TRUE ) ) die('You must provide a Goal Period End Date');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'goal_period_name', $sGoalPeriodName );
		$this->set( 'goal_period_description', $sGoalPeriodDescription );
		$this->set( 'start_date', $nStartDate );
		$this->set( 'end_date', $nEndDate );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>