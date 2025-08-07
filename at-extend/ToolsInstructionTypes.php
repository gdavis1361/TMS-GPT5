<?php 
/**
 * Tools Instruction Types
 *
 * @author Reid Workman
 */
 
class ToolsInstructionTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tools_instruction_types';
	
	const Orders = 1;
	const Stops = 2;

	public function create(	$sInstructionTypeName ) {
		// Validate Data
		if ( !is_string($sInstructionTypeName) ) return FALSE;
		
		// Save Data
		$this->set( 'instruction_type_name', $sInstructionTypeName );
		
		$this->save();
		
		// Report
		return ;
	}

	function make_list($sName, $nGroupId, $sClass='', $nDefault = 0, $sId = '', $vIncludeId = true) {
		$this->clear_filters();
		$this->where('instruction_group_id', '=',  $nGroupId);
		$o = $this->list();

		if( $sId == "" )
			$sId = $sName;
		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'"';
		if( $vIncludeId ) 
			$sHtml .= ' id="'.$sId.'"';
		$sHtml .= '>';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) {
			$id = $row->instruction_type_id;
			$name = $row->instruction_type_name;
			$sHtml .= "\n<option value=\"".$id.'"'.( ($nDefault == $id) ? ' selected="selected"' : '' ).'>'.$name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
}

?>