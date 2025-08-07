<?php 

/**
 * IndustryBase
 *
 * @author Steve Keylon
 */

class IndustryBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'industry_base';

	public function create( $nId, $sName, $nGroupId, $nCreatedById ) {
		
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_string($sName) ) {
			add_error('NAME requires a string', $key);
			return false;
		}
		if ( !is_numeric($nId) ) {
			add_error('Id requires a string', $key);
			return false;
		}
		if ( !is_numeric($nGroupId) ) {
			add_error('Group Id requires a string', $key);
			return false;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By requires a number', $key);
			return false;
		}
		
		$this->set_industry_id($nId);
		$this->set_industry_name($sName);
		$this->set_industry_group_id($nGroupId);
		$this->set_created_by_id($nCreatedById);
		$this->set_created_at(time());
		
		return $this->save();
	}
	
	function make_list($sName, $sClass='', $nDefault = 0) { 
		//$this->clear_filters();
		//$this->order('industry_name', 'ASC');
		//$o = $this->list();
		//info();
		
		//$sHtml = '<select name="'. $sName. '" class="'.$sClass.'" style="width: 250px">';
		//$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) { 
			//$sHtml .= "\n<input type='radio' value=\"".trim($row->industry_id).'"'.( ($nDefault == trim($row->industry_id)) ? ' checked="checked"' : '' ).' />' . trim($row->industry_id) . ": " . $row->industry_id .'';
			//$sHtml .= "\n<option value=\"".$row->industry_id.'"'.( ($nDefault == $row->industry_id) ? ' selected="selected"' : '' ).'>' . $row->industry_name . ": " . $row->industry_id .'</option>';
		}
		//$sHtml .= '</select>';
		return ''; //$sHtml;
	}
}
?>