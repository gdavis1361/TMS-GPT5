<?php 
/**
 * Tender Movement Instructions
 *
 * @author Reid Workman
 */
 
class TenderMovementInstructions extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_movement_instructions';

	public function create(	$nTenderMovementId, $nInstructionIndex, $nInstructionTypeId,
							$sInstruction,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nTenderMovementId) ) return FALSE;
		if ( !is_numeric($nInstructionIndex) ) return FALSE;
		if ( !is_numeric($nInstructionTypeId) ) return FALSE;
		if ( !is_string($sInstruction) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'tender_movement_id', $nTenderMovementId );
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