<?php 
/**
 * @author Reid Workman
 */
 
class EmailToVisit extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'email_to_visit';

	public function create(	$nEmailId, $nUserId, $nCreatedById ) {
		
		// Validate Data
		if ( !number( $nEmailId, TRUE ) ) die('You must provide an email id');
		if ( !number( $nUserId, TRUE ) ) die('You must provide an employee User id');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'email_id', $nEmailId );
		$this->set( 'user_id', $nUserId );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
	
}
?>