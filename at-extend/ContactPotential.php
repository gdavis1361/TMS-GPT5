<?php 
/**
 * Contact Potential
 *
 * @author Steve Keylon
 */
 
class ContactPotential extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_potential';

	public function create(	$sName, $sColor, $nIndex, $nCreatedById ) {
		// Validate Data
		
		if ( !is_string($sName) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_string($sColor) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_numeric($nIndex) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_numeric($nCreatedById) ) { 
			//error 
			return FALSE; 
		}
		
		// Save Data
		$this->set_potential_name($sName);
		$this->set_potential_index($nIndex);
		$this->set_color($sColor);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
	
	function make_list($sName, $sClass='', $nDefault = 0) { 
		$this->clear_filters();
		$o = $this->list();
		
		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'">'	
					. "<option value=''> -- </option>";
		foreach ($o->rows as $row) { 
			$sHtml .= "\n<option value=\"".$row->potential_id.'" '.
			( ($nDefault == $row->potential_id) ? ' selected="selected"' : '' ).' style="color:white;background-color:#' . $row->color . ';">'.$row->potential_name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
}

?>