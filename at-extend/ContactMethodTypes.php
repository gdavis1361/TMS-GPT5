<?php 
/**
 * Contact Method Types
 *
 * @author Steve Keylon
 */
 
class ContactMethodTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'contact_method_types';
	
	const Email = 5;
	
	public function create(	 $sMethodType, $nMethodGroupId, $nCreatedById ) {
		// Validate Data
		if (!is_numeric($nMethodGroupId) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_string($sMethodType) ) { 
			//error 
			return FALSE; 
		}
		if ( !is_numeric($nCreatedById) ) { 
			//error 
			return FALSE; 
		}
		
		// Save Data
		$this->set_method_type($sMethodType);
		$this->set_method_group_id($nMethodGroupId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
	
	function make_list($sName, $sClass='', $nMethodGroupId = 0, $nDefault = 0) { 
		$this->clear_filters();
		
		if ( $nMethodGroupId > 0 )
			$this->where('method_group_id', '=', $nMethodGroupId);
			
		$o = $this->list();
		
		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'">';
		foreach ($o->rows as $row) { 
			$sHtml .= "\n<option value=\"".$row->method_id.'" '.( ($nDefault == $row->method_id) ? ' selected="selected"' : '' ).'>'.$row->method_type.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
	
	/**
	 * returns an array of varialbes from contact_method_types and tools_method_groups
	 * array {
	 *		'method_id'			=> types.method_id
	 *		'method_type'		=> types.method_type
	 *		'method_group_id'	=> types.method_group_id
	 *		'group_name'		=> groups.group_name
	 * }
	 */
	public static function get_list(){
		$o = new DBModel();
		$o->connect();
		$sQuery = "SELECT types.method_id, types.method_type, types.method_group_id, groups.group_name 
					FROM contact_method_types types
					INNER JOIN tools_method_groups groups ON groups.groups_id = types.method_group_id";
		$res = $o->query( $sQuery );
		$aReturn = array();
		while( $row = $o->db->fetch_array( $res ) ){
			$aReturn[$row['method_id']] = $row;
		}
		return $aReturn;
	}
}

?>