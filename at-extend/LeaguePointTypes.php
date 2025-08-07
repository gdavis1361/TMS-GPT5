<?php 

/**
 * League Point Types
 *
 * @author Reid Workman
 */

class LeaguePointTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'league_point_types';

	public function create( $aPoint ) { //$nCreatedById, $sTypeName, $nGroupId, $nUnitTypeId ) {
		
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !isset($aPoint['point_type_name']) || !is_string($aPoint['point_type_name']) ) {
			add_error('Type Name: ' . $aPoint['point_type_name'], $key);
			return FALSE;
		}
		if ( !isset($aPoint['point_type_group_id']) || !is_numeric($aPoint['point_type_group_id']) ) {
			add_error('Group Id: ' . $aPoint['point_type_group_id'], $key);
			return FALSE;
		}
		if ( !isset($aPoint['unit_type_id']) || !is_numeric($aPoint['unit_type_id']) ) {
			add_error('Unit Type Id: ' . $aPoint['unit_type_id'], $key);
			return FALSE;
		}
		if ( !isset($aPoint['created_by_id']) || !is_numeric($aPoint['created_by_id']) ) {
			add_error('Created By Id: ' . $aPoint['created_by_id'], $key);
			return FALSE;
		}
		
		$this->set('point_type_name',     $aPoint['point_type_name']);
		$this->set('point_type_group_id', $aPoint['point_type_group_id']);
		$this->set('unit_type_id',        $aPoint['unit_type_id']);
		$this->set('created_by_id',       $aPoint['created_by_id'] );
		
		$nCreatedId = $this->get_created_by_id();
		if ( empty( $nCreatedId ) ) $this->set('created_by_id', $aPoint['created_by_id']);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($aPoint['created_by_id']);
			$this->set_updated_at(time());
		}
		
		return $this->save();
		
	}
	
	function get_active_value($nPointTypeId='') {
		if ( empty($nPointTypeId) ) {
			$nPointTypeId = $this->get('point_type_id');
		}
		
		$o = new LeaguePointValues();
		$o->where('point_type_id', '=', $nPointTypeId);
		$o->where('active', '=', '1');
		
		$a = $o->list()->rows;
		
		if (empty($a)) return array();
		
		return $a[0]->get();
	}
	
}

?>