<?php 
/**
 * Contact Reason Types
 *
 * @author Steve Keylon
 */
 
class ContactReasonTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_reason_types';

	public function create(	 $sTypeName, $nTypeGroupId, $nCreatedById ) {
		// Validate Data
		if (!is_numeric($nTypeGroupId) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_string($sTypeName) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_numeric($nCreatedById) ) { 
			//error 
			return FALSE; 
		}
		
		// Save Data
		$this->set_type_name($sTypeName);
		$this->set_type_group_id($nTypeGroupId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>