<?php
/**
 * Associate a load to a movement. 
 *
 * @author Steve Keylon
 */
class MovementToLoad extends DBModel {
	
	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'movement_to_load';
	
	function create( $aArgs ){
		// Validate input
		$key = __CLASS__ . '::' . __METHOD__;
		
		if (!isset($aArgs['movement_id'])) {
			add_error("Movement Id not provided", $key);
			return false;
		}
		
		if (!isset($aArgs['load_id'])){
			add_error("Load Id not provided", $key);
			return false;
		}
		
		$this->set('load_id', $aArgs['load_id']);
		$this->set('movement_id', $aArgs['movement_id']);
		$this->set('created_by_id', get_user_id());
		$this->set('created_at', time());
		
		return $this->save();
		
	}
}

?>
