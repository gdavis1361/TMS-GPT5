<?php 
/**
 * User Branches
 *
 * @author Reid Workman
 */
 
class UserBranches extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_branches';

	public function create(	$sBranchName, $nStartDate, $vActive ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_string($sBranchName) ){
			add_error('Branch Name: ' . print_r($sBranchName, 1), $key);
			return false;
		}
		if ( !is_numeric($nStartDate) ) {
			add_error('Start Date: ' . print_r($nStartDate, 1), $key);
			return false;
		}
		if ( !is_numeric($vActive) ) {
			add_error('Active: ' . print_r($vActive, 1), $key);
			return false;
		}
		
		// Save Data
		$this->set( 'branch_name', $sBranchName );
		$this->set( 'start_date', $nStartDate );
		$this->set( 'active', $vActive );
		
		return $this->save();
	}

	function make_list($sName, $sClass='', $nDefault = 0) {
		$this->clear_filters();
		$o = $this->list();
		
		
		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'">';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) {
			$id = $row->branch_id;
			$name = $row->branch_name;
			$sHtml .= "\n<option value=\"".$id.'"'.( ($nDefault == $id) ? ' selected="selected"' : '' ).'>'.$name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
	
	function find_id($sName){
		$this->clear_filters();
		$this->where('branch_name', '=', $sName);
		$a = $this->list()->rows;
		if ( isset($a[0]) ) {
			return $a[0]->get('branch_id');
		}
		return 0;
	}
}

?>