<?php 
/**
 * Document Base
 *
 * @author Steve Keylon
 */
 
class DocumentTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'document_types';

	public function create(	$aVars ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		
		if ( !isset($aVars['document_type_name']) ) {
			add_error('Must provide a Name', $key);
			return false;
		}

		foreach($aVars as $k => $v) {
			$this->set($k, $v);
		}
		
		return $this->save();
		
	}

	function make_list($sName, $sClass='', $nDefault = 0) {
		$this->clear_filters();
		$o = $this->list();

		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'">';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) {
			$id  = $row->document_type_id;
			$name = $row->document_type_name;
			$sHtml .= "\n<option value=\"".$id.'"'.( ($nDefault == $id) ? ' selected="selected"' : '' ).'>'.$name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
	
}
?>