<?php 
/**
 * @author Reid Workman
 */
 
class CallDetails extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'call_details';

	public function create(	$nCallId, $nCommentTypeId, $sComment, $nCreatedById ) {
		// Prep Variables (trim and substr)
		$sComment = prep_var($sComment);
		
		// Validate Data
		if ( !number( $nCallId, TRUE ) ) {
			add_error('You must provide the call id to match', $key);
			return FALSE;
		}
		if ( !number( $nCommentTypeId, TRUE ) ) {
			add_error('You must provide the Comment Type Id', $key);
			return FALSE;
		}
		if ( !string( $sComment, TRUE ) ) {
			add_error('You must provide a comment to save.', $key);
			return FALSE;
		}
		
		if ( !number( $nCreatedById, TRUE ) ) {
			add_error('You must specify a Created By User Id', $key);
			return FALSE;
		}
		
		// Save Data
		$this->set( 'call_id', $nCallId );
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