<?php

/**
 * Pre Order Instructions
 *
 * @author Steve Keylon
 */

class PreOrderStopInstructions extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_stop_instructions';

	public function create(	$nPreOrderId,
							$nStopIndex,
							$nInstructionIndex,
							$nInstructionType,
							$sInstructionValue,
							$nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPreOrderId) ) {
			add_error('PreOrder Id: ' . $nPreOrderId, $key);
			return FALSE;
		}
		if ( !is_numeric($nStopIndex) ) {
			add_error('Stop Index: ' . $nStopIndex, $key);
			return FALSE;
		}
		if ( !is_numeric($nInstructionIndex) ) {
			add_error('Instruction Index: ' . $nInstructionIndex, $key);
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
		$this->set_stop_index($nStopIndex);
		$this->set_instruction_index($nInstructionIndex);
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

		$this->set('instruction_index', $this->count_Instructions($nPreOrderId, $nStopIndex) );

		$this->save();

		// Report
		return true;
	}

	public function count_instructions($nPreOrderId, $nStopIndex) {
		$this->where('pre_order_id', '=', $nPreOrderId);
                $this->where('stop_index', '=', $nStopIndex);
		return $this->list()->selected_rows;
	}

	public function get_name(){
		$nId = $this->get_instruction_type_id();
		if ( empty($nId) ) return '';
		$o = new ToolsInstructionTypes();
		$o->load($nId);
		return $o->get_instruction_type_name();
	}
}

?>