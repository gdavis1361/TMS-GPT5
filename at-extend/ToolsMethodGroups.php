<?php 
/**
 * Tools Groups
 *
 * @author Reid Workman
 */
 
class ToolsMethodGroups extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tools_method_groups';

	static $PHONE = 1;
	static $EMAIL = 2;
	
	const PhoneType = 1;
	const EmailType = 2;
	const IMType = 3;

	public function create(	$sGroupName ) {
		// Validate Data
		if ( !is_string($sGroupName) ) return FALSE;
		
		// Save Data
		$this->set( 'group_name', $sGroupName );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>