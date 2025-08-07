<?php 
/**
 * @author Reid Workman
 */
 
class EmailRecipients extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'email_recipients';

	public function create(	$nEmailId, $sRecipientType, $sRecipientName, $nCreatedById ) {
		
		// Prep Variables (trim and substr)
		$sRecipientType = prep_var( $sRecipientType, 3 );
		$sRecipientName = prep_var( $sRecipientName, 100 );
		
		// Validate Data
		if ( !number( $nEmailId, TRUE ) ) die('You must provide an email id');
		if ( !string( $sRecipientType, TRUE ) ) die('You must provide a recipient Type');
		if ( !string( $sRecipientName, TRUE ) ) die('You must provide a recipient Name');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Get new Index
		$nEmailIndex = $this->current_index( $nEmailId ) + 1 ;
		
		// Save Data
		$this->set( 'email_id', $nEmailId );
		$this->set( 'email_index', $nEmailIndex );
		$this->set( 'comment_type_id', $sRecipientType );
		$this->set( 'comment', $sRecipientName );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
	
	public function current_index( $nEmailId ) {
		$res = $this->query('
			SELECT max(activity_index) as LAST_ID
			FROM '.$this->m_sTableName.'
			WHERE email_id = '.$nEmailId.'
		');
		if ( $this->db->num_rows($res) > 0 && $row = $this->db->fetch_object($res) ) {
			return $row->LAST_ID;
		}
		else {
			return 0;
		}
	}
}
?>