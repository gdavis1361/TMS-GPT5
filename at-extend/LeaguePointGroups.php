<?php 

/**
 * League Point Groups
 *
 * @author Steve Keylon
 */

class LeaguePointGroups extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_point_groups';

	public function create( $aPointGroup ) { //$sName, $nCreatedById ) {
		
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !isset($aPointGroup['name']) || !is_string($aPointGroup['name']) ) {
			add_error('Name: ' . $aPointGroup['name'], $key);
			return FALSE;
		}
		
		if ( !isset($aPointGroup['created_by_id']) || !is_numeric($aPointGroup['created_by_id']) ) {
			add_error('Created By Id: ' . $aPointGroup['created_by_id'], $key);
			return FALSE;
		}
		
		$this->set_group_name($aPointGroup['name']);
		$nCreatedId = $this->get_created_by_id();
		if ( empty( $nCreatedId ) ) $this->set_created_by_id($aPointGroup['created_by_id']);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($aPointGroup['created_by_id']);
			$this->set_updated_at(time());
		}
		
		return $this->save();
	}

	function make_list($sName, $sClass='', $nDefault = 0) {
		$this->clear_filters();
		$o = $this->list();

		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'">';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) {
			$sHtml .= "\n<option value=\"".$row->group_id.'"'.( ($nDefault == $row->group_id) ? ' selected="selected"' : '' ).'>'.$row->group_name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
}
?>