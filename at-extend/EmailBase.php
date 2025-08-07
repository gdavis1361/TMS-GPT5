<?php 
/**
 * @author Reid Workman
 */
 
class EmailBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'email_base';

	public function create(	$nEmailDate, $sEmailSender, $sEmailSubject, 
							$nEmailSenderContactId, $sEmailBody, $nCreatedById ) {
		
		// Prep Variables (trim and substr)
		$sEmailSubject = prep_var( $sEmailSubject, 250 );
		
		// Validate Data
		if ( !number( $nEmailDate, TRUE ) ) die('You must provide an email id');
		if ( !string( $sEmailSender, TRUE ) ) die('You must provide a Sender');
		if ( !string( $sEmailSubject ) ) die('You must provide a Subject');
		if ( !string( $sEmailBody ) ) die('You must provide a Message Body');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'email_date', $nEmailDate );
		$this->set( 'sender', $sEmailSender );
		$this->set( 'subject', $sEmailSubject );
		$this->set( 'sender_contact_id', $nEmailSenderContactId );
		$this->set( 'body', $sEmailBody );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>