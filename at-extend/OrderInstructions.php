<?php

/**
 * Order Instructions
 *
 * @author Steve Keylon
 */

class OrderInstructions extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'order_instructions';

	public function create(	$nOrderId,
							$nInstructionType,
							$sInstructionValue,
							$nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nOrderId) ) {
			add_error('Order Id: ' . $nOrderId, $key);
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
		$this->set_order_id($nOrderId);
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

		$this->set_Instruction_index( $this->count_Instructions($nOrderId) + 1 );

		$this->save();

		// Report
		return true;
	}

	public function count_Instructions($nOrderId) {
		$this->where('order_id', '=', $nOrderId);
		return $this->list()->selected_rows;
	}
}

?>