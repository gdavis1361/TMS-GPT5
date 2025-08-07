<?php 
/**
 * Contact to Visit
 *
 * @author Steve Keylon
 */
 
class ContactToVisit extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_to_visit';

	public function create(	$nVisitId, $nContactId, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nVisitId) ) { 
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
		$this->set_visit_id($nVisitId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>