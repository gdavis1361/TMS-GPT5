<?php 
/**
 * User Permissions
 *
 * @author Steve Keylon
 */

class UserPermissions extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_permissions';

	public function create( $sPermissionDesc, $sPermissionGroup, $nCreatedById ) {
		// Validate Data
		if ( !is_string($sPermissionDesc) ) return FALSE;
		if ( !is_string($sPermissionGroup) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_permission_desc($sPermissionDesc);
		$this->set_permission_group($sPermissionGroup);
		$this->set_customer_id($nCustomerId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time()); 
		$this->save();
		// Report
		return;
	}
}
?>