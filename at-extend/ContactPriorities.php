<?php 
/**
 * Contact Priorities
 *
 * @author Steve Keylon
 */
 
class ContactPriorities extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_priorities';

	public function create(	$sName ) {
		// Validate Data
		if ( !is_string($sName) ) { 
			//error 
			return FALSE; 
		}
		
		// Save Data
		$this->set_priority_name($sName);
		$this->set_priority_index( $this->get_NextIndex() );
		
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
			$sHtml .= "\n<option value=\"".$row->priority_id.'"'.( ($nDefault == $row->priority_id) ? ' selected="selected"' : '' ).'>'.$row->priority_name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
	
	function get_NextIndex() {
		$this->clear_filters();
		$this->order('priority_index', 'desc');
		$oList = $this->list();
		$a = $oList->rows;
		$o = new ContactPriorities();
		if ( is_array($a) && isset($a[0]) && !empty($a[0]) ) {
			return $a[0]->get_priority_Index() + 1;
		}else{
			// No contacts, so give it index #1
			return 1;
		}
	}
}

?>