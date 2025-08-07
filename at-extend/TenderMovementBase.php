<?php 
/**
 * Tender Movement Base
 *
 * @author Reid Workman
 */
 
class TenderMovementBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_movement_base';

	public function create(	$nTenderLoadId, $nInstructionIndex, 
							$nInstructionTypeId, $sInstruction, 
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nTenderLoadId) ) return FALSE;
		if ( !is_numeric($nInstructionIndex) ) return FALSE;
		if ( !is_numeric($nInstructionTypeId) ) return FALSE;
		if ( !is_string($sInstruction) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'tender_load_id', $nTenderLoadId );
		$this->set( 'instruction_index', $nInstructionIndex );
		$this->set( 'instruction_type_id', $nInstructionTypeId );
		$this->set( 'instruction', $sInstruction );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>