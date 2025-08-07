<?php 

/**
 * League Point Values
 *
 * @author Steve Keylon
 */

class LeaguePointValues extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_point_values';

	public function create( $aPoint ) {
	
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !isset($aPoint['point_type_id']) || !is_numeric($aPoint['point_type_id']) ) {
			add_error('Point Type Id: ' . $aPoint['point_type_id'], $key);
			return FALSE;
		}
		if ( !isset($aPoint['effective_date']) || !is_string($aPoint['effective_date']) ) {
			add_error('Effective Date: ' . $aPoint['effective_date'], $key);
			return FALSE;
		}
		if ( !isset($aPoint['point_value']) || !is_numeric($aPoint['point_value']) ) {
			add_error('Point Value: ' . $aPoint['point_value'], $key);
			return FALSE;
		}
		if ( !isset($aPoint['created_by_id']) || !is_numeric($aPoint['created_by_id']) ) {
			add_error('Created By Id: ' . $aPoint['created_by_id'], $key);
			return FALSE;
		}
		
		$aPoint['active'] = strtotime($aPoint['effective_date']) == strtotime(date('Y-m-d') ) ? '1' : '0' ;
		
		//echo ($aPoint['active'] == '1' ? 'It is Active' : 'It is not yet active');
		
		$this->set_point_type_id($aPoint['point_type_id']);
		$this->set_effective_date($aPoint['effective_date']);
		$this->set_point_value($aPoint['point_value']);
		$this->set_active($aPoint['active']);
		
		$nCreatedId = $this->get_created_by_id();
		if ( empty( $nCreatedId ) ) $this->set_created_by_id($aPoint['created_by_id']);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($aPoint['created_by_id']);
			$this->set_updated_at(time());
		}
		
		$s = "UPDATE tms.dbo." . $this->m_sTableName . " 
				SET active = '0'
				WHERE point_type_id = " . $this->db->sql_escape($aPoint['point_type_id']);
		//echo $s;
		
		//De activate any others if this is set to be active
		if ($aPoint['active'] == '1') 
			$this->db->query($s);
		
		return $this->save();
	}
}
?>