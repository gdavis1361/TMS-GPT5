<?php 
/**
 * @author Reid Workman
 */
 
class EquipmentToGroups extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'equipment_to_groups';

	public function create(	$nEquipmentId, $nGroupId, $nCreatedById ) {
		
		// Validate Data
		if ( !number( $nEquipmentId, TRUE ) ) die('You must specify an Equipment Id');
		if ( !number( $nGroupId, TRUE ) ) die('You must specify a Group Id');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'equipment_id', $nEquipmentId );
		$this->set( 'group_id', $nGroupId );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>