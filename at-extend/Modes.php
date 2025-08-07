<?php

/**
 * Modes
 *
 * @author Steve Keylon
 */

class Modes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'modes';

	public function create( $sName, $nCreatedById ) {
		
		$key = __CLASS__ . '::' . __METHOD__;

		// Validate input
		if ( !is_string($sName) ) {
			add_error('You must provide a Name', $key);
			return FALSE;
		}

		// Save Input
		$this->set_mode_name($sName);
		$this->set_created_by_id($nCreatedById);

		$this->save();

		// Report
		return;
	}

	public static function make_list($sName, $sClass='', $nDefault = 0) {
		$oModes = new Modes();
		$oModes->clear_filters();
		$o = $oModes->list();

		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'">';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) {
			$sHtml .= "\n<option value=\"".$row->mode_id.'"'.( ($nDefault == $row->mode_id) ? ' selected="selected"' : '' ).'>'.$row->mode_name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}

	public static function get_name($nModeId) {
		$o = new Modes();
		$o->load($nModeId);
		return $o->get_mode_name();
	}
	
	function find_id($sName){
		$this->clear_filters();
		$this->where('mode_name', '=', $sName);
		$a = $this->list()->rows;
		if ( isset($a[0]) ) {
			return $a[0]->get('mode_id');
		}
		return 0;
	}
}

?>
