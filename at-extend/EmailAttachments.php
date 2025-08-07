<?php 
/**
 * @author Reid Workman
 */
 
class EmailAttachments extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'email_attachments';

	public function create(	$nEmailId, $nDocumentId, $nCreatedById ) {
		
		// Validate Data
		if ( !number( $nEmailId, TRUE ) ) die('You must provide an email id');
		if ( !number( $nDocumentId, TRUE ) ) die('You must provide a group id');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'document_type_group_id', $nEmailId );
		$this->set( 'document_type_name', $nDocumentId );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>