<?php 
/**
 * Contact to Email
 *
 * @author Steve Keylon
 */
 
class ContactToEmail extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_to_email';

	public function create(	$nContactId, $nEmailId, $nCreatedById ) {
		// Validate Data
		if (!is_numeric($nEmailId) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_numeric($nContactId) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_numeric($nCreatedById) ) { 
			//error 
			return FALSE; 
		}
		
		// Save Data
		$this->set_contact_id($nContactId);
		$this->set_email_id($nEmailId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>