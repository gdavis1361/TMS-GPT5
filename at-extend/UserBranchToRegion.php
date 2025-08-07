<?php 
/**
 * User Branch To Region
 *
 * @author Reid Workman
 */
 
class UserBranchToRegion extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_branch_to_region';

	public function create(	$nRegionId, $nBranchId ) {
		// Validate Data
		if ( !is_numeric($nRegionId) ) return FALSE;
		if ( !is_numeric($nBranchId) ) return FALSE;
		
		// Save Data
		$this->set( 'region_id', $nRegionId );
		$this->set( 'branch_id', $nBranchId );
		
		$this->save();
		
		return TRUE;
	}

}

?>