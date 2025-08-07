<?php 
/**
 * @author Reid Workman
 */
 
class EmailDetails extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'email_details';

	public function create(	$nEmailId, $nCommentTypeId, $sComment, $nCreatedById ) {
		
		// Prep Variables (trim and substr)
		$sComment = prep_var( $sComment );
		
		// Validate Data
		if ( !number( $nEmailId, TRUE ) ) die('You must provide an email id');
		if ( !number( $nCommentTypeId, TRUE ) ) die('Comment type id must be a integer');
		if ( !string( $sComment ) ) die('Your comment must be a string');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'email_id', $nEmailId );
		$this->set( 'comment_type_id', $nCommentTypeId );
		$this->set( 'comment', $sComment );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>