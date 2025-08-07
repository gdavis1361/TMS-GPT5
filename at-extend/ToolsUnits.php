<?php 
/**
 * Tools Units
 *
 * @author Reid Workman
 */
 
class ToolsUnits extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tools_units';

	public function create(	$sUnitName, $nGroupId ) {
		// Validate Data
		if ( !is_string($sUnitName) ) return FALSE;
		if ( !is_numeric($nGroupId) ) return FALSE;
		
		// Save Data
		$this->set( 'unit_name', $sUnitName );
		$this->set( 'group_id', $nGroupId );
		
		$this->save();
		
		// Report
		return ;
	}

	function make_list($sName, $sClass='', $nDefault = 0) {
		$this->clear_filters();
		$o = $this->list();

		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'">';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) {
			$sHtml .= "\n<option value=\"".$row->unit_id.'"'.( ($nDefault == $row->unit_id) ? ' selected="selected"' : '' ).'>'.$row->unit_name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
}

?>