<?php 
/**
 * @author Reid Workman
 */
 
class EquipmentExtended extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'equipment_extended';

	public function create(	$nEquipmentId, $sDimUnit = FALSE, $nHeight = FALSE, 
							$nWidth = FALSE, $nLength = FALSE, $nCreatedById ) {
		
		// Prep Variables (trim and substr)
		if ( $sDimUnit ) $sDimUnit = prep_var( $sDimUnit, 2 );
		
		// Validate Data
		if ( !number( $nEquipmentId, TRUE ) ) die('Equipment Id is required');
		if ( $sDimUnit && !string( $sDimUnit ) ) die('Dim Unit must be a string');
		if ( $nHeight && !number( $nHeight ) ) die('Height must be a number (eg. x.xxxx)');
		if ( $nWidth && !number( $nWidth ) ) die('Width must be a number (eg. x.xxxx)');
		if ( $nLength && !number( $nLength ) ) die('Length must be a number (eg. x.xxxx)');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'equipment_id', $nEquipmentId );
		if ( $sDimUnit ) $this->set( 'dim_unit', $sDimUnit );
		if ( $nHeight ) $this->set( 'height', $nHeight );
		if ( $nWidth ) $this->set( 'width', $nWidth );
		if ( $nLength ) $this->set( 'length', $nLength );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
	
}
?>