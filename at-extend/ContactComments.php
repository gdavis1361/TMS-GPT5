
<?php 
/**
 * Contact Comments
 *
 * @author Steve Keylon
 */
 
class ContactComments extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_comments';

	public function create(	$nContactId, $sComment, $nTypeId, $nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		
		if ( !number($nContactId) ) {
			add_error('Contact ID requires a number', $key);
			return false;
		}
		if ( !string($sComment) ) {
			add_error('Comment required a string', $key);
			return false;
		}
		if ( !number($nTypeId) ) {
			add_error('COMMENT TYPE ID requires a number', $key);
			return false;
		}
		if ( !number($nCreatedById) ) {
			add_error('CREATED BY ID requires a number', $key);
			return false;
		}
		// Save Data
		$this->set_contact_id($nContactId);
		$this->set_Comment_index( '0' );
		//$this->set_comment_source_id( $nContactId );
		$this->set_comment($sComment);
		$this->set('comment_type_id', $nTypeId);
		$this->set_Expiration_Date( date('Y-m-d', strtotime('+5 years') ) );
		$this->set_created_by_id($nCreatedById);
		
		$this->save();
		
		
		$sType = null;
		if ( in_array($nTypeId, $this->aCallTypes) ) $sType = 'call';
		if ( in_array($nTypeId, $this->aEmailTypes) ) $sType = 'email';
		if ( in_array($nTypeId, $this->aVisitTypes) ) $sType = 'visit';
		
		echo "Found $sType type";
		
		
		error_log('doing this thing');
		
		// Report
		return true;;
	}
}

?>