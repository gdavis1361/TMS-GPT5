<?php 
/**
 * Tools Comment Types
 *
 * @author Reid Workman
 */
 
class ToolsCommentTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tools_comment_types';
	
	const Contacts = 3;
	const Orders = 2;
	const Company = 4;
	const Carriers = 5;
	
	private static $ContactCallTypes = array(1,2,4);
	private static $ContactEmailTypes = array(9,10,11);
	private static $ContactVisitTypes = array(12,13);

	public function create(	$nCommentTypeId, $sCommentTypeName, $nCommentGroupId ) {
		// Validate Data
		if ( !is_string($sCommentTypeName) ) return FALSE;
		if ( !is_numeric($nCommentGroupId) ) return FALSE;
		
		// Save Data
		$this->set( 'comment_type_name', $sCommentTypeName );
		$this->set( 'comment_group_id', $nCommentGroupId );
		
		$this->save();
		
		// Report
		return ;
	}
	
	function make_list($sName, $nGroupId, $sClass='', $nDefault = 0) { 
		$this->clear_filters();
		$this->where('comment_group_id', '=', $nGroupId);
		$o = $this->list();
		
		$sHtml = '<select name="'. $sName. '" class="'.$sClass.'">';
		$sHtml .= "<option value=''> -- </option>";
		foreach ($o->rows as $row) { 
			$sHtml .= "\n<option value=\"".$row->comment_type_id.'"'.( ($nDefault == $row->comment_type_id) ? ' selected="selected"' : '' ).'>'.$row->comment_type_name.'</option>';
		}
		$sHtml .= '</select>';
		return $sHtml;
	}
	
	public static function typeName($nId){
		if (empty($nId)) return '';
		$o = new ToolsCommentTypes();
		$o->where('comment_type_id', '=', $nId);
		$a = $o->list()->rows;
		
		if (!empty($a[0])) return $a[0]->get('comment_type_name');
		
		
		return '';
	}
	
	public static function ContactCommentTypes($sType){
		$sType = strtolower($sType);
		switch ($sType){
			case 'call':
				return self::$ContactCallTypes;
				break;
			case 'email':
				return self::$ContactEmailTypes;
				break;
			case 'visit':
				return self::$ContactVisitTypes;
				break;
			default:
				return array();
				break;
		}
	}
}

?>