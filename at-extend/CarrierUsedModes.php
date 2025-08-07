<?php 
/**
 * Carrier Used Modes
 *
 * @author Steve Keylon
 */
 
class CarrierUsedModes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_used_modes';

	public function create(	$nCarrierId, $nModeId, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_numeric($nModeId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_carrier_id($nCarrierId);
		$this->set_mode_id($nModeId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(date('M d Y H:i A'));
		
		$this->save();
		
		// Report
		return $this->get_carrier_used_modes_id();
	}
	
	/**
	 *
	 */
	public static function get_mode_objects_by_carrier_id( $nCarrierId ){
		if( empty( $nCarrierId ) || !is_numeric( $nCarrierId ) ) return false;
		$o = new DBModel();
		$o->connect();
		$sQuery = "SELECT used_modes.*, modes.mode_name FROM carrier_used_modes used_modes 
					INNER JOIN modes modes
					ON modes.mode_id = used_modes.mode_id
					WHERE used_modes.carrier_id = $nCarrierId
					ORDER BY used_modes.created_at ASC";
		$res = $o->query( $sQuery );
		$aReturn = array();
		while( $row = $o->db->fetch_object( $res ) ){
			$aReturn[] = $row;
		}
		return $aReturn;
	}
}

?>