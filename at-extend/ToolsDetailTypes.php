<?php 
/**
 * Tools Detail Types
 *
 * @author Reid Workman
 */
 
class ToolsDetailTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tools_detail_types';

	public function create(	$sDetailName ) {
                $this->unload();
		// Validate Data
		if ( !is_string($sDetailName) ) return FALSE;
		
		// Save Data
		$this->set( 'detail_type_name', $sDetailName );
                $this->set( 'detail_group_id', 0 );
		
		return $this->save();
	}

	function make_list($sName, $nGroupId, $sClass='', $nDefault=0, $sId='', $vIncludeId = true) {
		$this->clear_filters();
		$this->where('detail_group_id', '=',  $nGroupId);
		$o = $this->list();

		$sHtml = '<select';
		if( $vIncludeId )
			$sHtml .= ' id="'.$sId.'"';
		$sHtml .= ' class="'.$sClass.'" name="'.$sName.'">';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) {
			$sHtml .= "\n<option value=\"".$row->detail_type_id.'"'.( ($nDefault == $row->detail_type_id) ? ' selected="selected"' : '' ).'>'.$row->detail_type_name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}

	public static function get_name($nDetailId) {
		$o = new ToolsDetailTypes();
		$o->load($nDetailId);
		return $o->get_detail_type_name();
	}
}

?>