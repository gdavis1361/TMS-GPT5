<?php 
/**
 * Contact Used Modes
 *
 * @author Steve Keylon
 */
 
class ContactUsedModes extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'contact_used_modes';

	public function create( $nContactId, $nModeId) {
		// Validate Data
		if ( !is_numeric($nModeId) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_numeric($nContactId) ) { 
			//error 
			return FALSE; 
		}
		
		// Save Data
		$this->set_contact_id($nContactId);
		$this->set_mode_id($nModeId);
		
		$this->save();
		
		// Report
		return ;
	}
	
}