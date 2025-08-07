<?php

/**
 * Pre Order Instructions
 *
 * @author Steve Keylon
 */

class PreOrderInstructions extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_instructions';

	public function create(	$nPreOrderId,
							$nInstructionType,
							$sInstructionValue,
							$nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('PreOrder Id: ' . $nPreOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nInstructionType) ) {
			add_error('Instruction Type: ' . $nInstructionType, $key);
			return FALSE;
		}
		if ( !is_string($sInstructionValue) ) {
			add_error('Instruction Value: ' . $sInstructionValue, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By: ' . $nCreatedById, $key);
			return FALSE;
		}

		// Insert/Save
		$this->set_pre_order_id($nPreOrderId);
		$this->set_Instruction_type_id($nInstructionType);
		$this->set_Instruction($sInstructionValue);

		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}

		$this->set_Instruction_index( $this->count_Instructions($nPreOrderId) + 1 );

		$this->save();

		// Report
		return true;
	}

	public function count_Instructions($nPreOrderId) {
		$this->where('pre_order_id', '=', $nPreOrderId);
		return $this->list()->selected_rows;
	}
}

?>