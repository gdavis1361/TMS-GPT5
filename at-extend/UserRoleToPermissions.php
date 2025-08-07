<?php 
/**
 * User Role to Permissions
 *
 * @author Steve Keylon
 */

class UserRoleToPermissions extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_role_to_permissions';

	public function create( $nRoleId, $nPermissionId, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nRoleId) ) return FALSE;
		if ( !is_numeric($nPermissionId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_role_id($nRoleId);
		$this->set_permission_id($nPermissionId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time()); 
		$this->save();
		// Report
		return;
	}
	
	public function role_permissions($nRoleId) { 
		$this->add_Filter('role_id', '=', $nRoleId);
		return $this->list();
	}
}
?>