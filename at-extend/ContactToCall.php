<?php 
/**
 * Contact to Call
 *
 * @author Steve Keylon
 */
 
class ContactToCall extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_to_call';

	public function create(	$nContactId, $nCallId, $nCreatedById ) {
		// Validate Data
		if (!is_numeric($nCallId) ) { 
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
		$this->set_call_id($nCallId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>