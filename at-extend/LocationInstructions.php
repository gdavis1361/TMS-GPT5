<?php 
/**
 * Location Instructions
 *
 * @author Steve Keylon
 */
 
class LocationInstructions extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'location_instructions';

	public function create(	$nLocationId, $nInstructionTypeId, $nInstructionIndex, $sInstruction, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nLocationId) ) return FALSE;
		if ( !is_numeric($nInstructionTypeId) ) return FALSE;
		if ( !is_numeric($nInstructionIndex) ) return FALSE;
		if ( !is_string($sInstruction) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_location_id( $nLocationId );
		$this->set_instruction_type_id( $nInstructionTypeId );
		$this->set_instruction_index( $nInstructionIndex );
		$this->set_instruction( $sInstruction );
		$this->set_created_by_id( $nCreatedById ); 
		$this->set_created_at( 'date()' );
		
		$this->save();
		
		// Report
		return ;
	}
	
	/**
	 * get a list of all instructions given a location_id
	 * @param $nLocId a location_id
	 * @return an array of all location_instructions
	 *			array() = {
	 *						[location_id]				=> a location_id
	 *						[instruction_type_id]		=> instruction_type_id tms.tools_location_types
	 *						[instruction_index]			=> the index of the instruction at this location
	 *						[instruction]				=> the text instruction
	 *						[created_by_id]				=> user_id of the creator of this instruction
	 *						[created_at]				=> date of instruction creation
	 *						[updated_by_id]				=> user_id of the updater of this instruction
	 *						[updated_at]				=> the update date
	 *						[instruction_type_name]		=> the name of the type of instruction
	 *						[instruction_group_name]	=> the instruction's group name
	 *					}
	 */
	public static function get_instructions_by_location_id( $nLocId ){
		if( empty( $nLocId ) || !is_numeric( $nLocId ) ) return array();
		$sQuery = "SELECT inst.*, type.instruction_type_name, grp.instruction_group_name
					FROM location_instructions inst
						INNER JOIN tools_instruction_types type
						ON type.instruction_type_id = inst.instruction_type_id
					
						INNER JOIN tools_instruction_groups grp
						ON grp.instruction_group_id = type.instruction_group_id
					WHERE inst.location_id = $nLocId
					ORDER BY inst.instruction_index ASC";
		$o = new DBModel();
		$o->connect();
		$res = $o->query( $sQuery );
		$aReturn = array();
		while( $row = $o->db->fetch_object( $res ) ){
			// these next two values are only to fool the js on preorder and order edit pages
			$row->pre_order_stop_instruction_id = -1;
			$row->order_stop_instruction_id = -1;
			$row->stop_index = $row->instruction_index;
			$aReturn[] = (array)$row;
		}
		return $aReturn;
	}
}

?>