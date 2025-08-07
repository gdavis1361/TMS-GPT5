<?php 
/**
 * @author Reid Workman
 */
 
class EquipmentToModes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'equipment_to_modes';

	public function create(	$nEquipmentId, $nModeId, $nCreatedById ) {
		
		// Validate Data
		if ( !number( $nEquipmentId, TRUE ) ) die('You must specify an Equipment Id');
		if ( !number( $nModeId, TRUE ) ) die('You must specify a Mode Id');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'equipment_id', $nEquipmentId );
		$this->set( 'mode_id', $nModeId );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>