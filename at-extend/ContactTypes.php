<?php 
/**
 * Contact Types
 *
 * @author Steve Keylon
 */
 
class ContactTypes extends DBModel {

	var $m_sClassName =  __CLASS__;
	var $m_sTableName = 'contact_types';
	
	const Customer = 2;
	const Carrier = 3;
	const BillTo = 4;
	const PayTo = 5;
	const AATEmployee = 6;

	public function create( $sTypeName, $sTypeDescription, $nCreatedById ) {
	
		$key = __CLASS__ . '::' . __METHOD__;
		
		// Validate Data
		if ( !is_string($sTypeDescription) ) {
			var_dump($sTypeDescription);
			add_error('Type Description: ' . $sTypeDescription, $key);
			return false;
		}
		if ( !is_string($sTypeName) ) {
			add_error('Type Name: ' . $sTypeName, $key);
			return false;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return false;
		}
		
		// Save Data
		$this->set_type_name($sTypeName);
		$this->set_type_desc($sTypeDescription);
		
		if ( !$this->is_loaded() ) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at( time() );
		}
		
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
			$sHtml .= "\n<option value=\"".$row->type_id.'"'.( ($nDefault == $row->type_id) ? ' selected="selected"' : '' ).'>'.$row->type_name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
}

?>