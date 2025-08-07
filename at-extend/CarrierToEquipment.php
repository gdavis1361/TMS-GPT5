<?php 
/**
 * Carrier to Equipment
 *
 * @author Steve Keylon
 */
 
class CarrierToEquipment extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'carrier_to_equipment';

	public function create(	$nCarrierId, $nJaguarEquipmentId, $nQuantity, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_numeric($nJaguarEquipmentId) ) return FALSE;
		if ( !is_numeric($nQuantity) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_carrier_id($nCarrierId);
		$this->set_jaguar_equipment_id($nJaguarEquipmentId);
		$this->set_quantity($nQuantity);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(date('M d Y H:i A'));
		
		$this->save();
		
		// Report
		return ;
	}
	
	public static function get_equipment_objects_by_carrier_id( $nCarrierId ){
		if( empty( $nCarrierId ) || !is_numeric( $nCarrierId ) ) return false;
		$o = new DBModel();
		$o->connect();
		$sQuery = "SELECT c2e.*, equip.CarrEquipDesc 
					FROM carrier_to_equipment c2e
					INNER JOIN ContractManager.dbo.AvailableEquipment equip
					ON equip.CarrEquipId = c2e.jaguar_equipment_id
					WHERE c2e.carrier_id = $nCarrierId
					ORDER BY c2e.created_at ASC";
		$res = $o->query( $sQuery );
		$aReturn = array();
		while( $row = $o->db->fetch_object( $res ) ){
			$aReturn[$row->jaguar_equipment_id] = $row;
		}
		return $aReturn;
	}
}

?>