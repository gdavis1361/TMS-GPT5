<?php 
/**
 * Contact to Accounting
 *
 * @author Steve Keylon
 */
 
class ContactToAccounting extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_to_accounting';

	public function create(	$nContactId, $nAccountingId, $nCreatedById ) {
		// Validate Data
		if (!is_numeric($nAccountingId) ) { 
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
		$this->set_accounting_id($nAccountingId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>