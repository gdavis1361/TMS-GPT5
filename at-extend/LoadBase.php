<?php

/**
 * Load Base
 *
 * @author Kelvin White
 *
 */

class LoadBase extends DBModel {

    var $m_sClassName = __CLASS__;
    var $m_sTableName = 'load_base';

    public function create( $nCarrierId,
                            $nTeamUsed, 
                            $nPowerUnitId, 
                            $nEquipmentId,
                            $nModeId, 
							$nMovementId,
                            $nCreatedById,
                            $nOrderId) {

        $key = __CLASS__ . '::' . __METHOD__;
        
        /*foreach(func_get_args() as $arg)
        {
            if ( !is_numeric($arg) ) 
            {
                add_error('id: '. $arg, $key);
                return FALSE;
            }
        }*/
        
        if ( !is_numeric($nCarrierId) ) {
            add_error('Carrier id: '. $nCarrierId, $key);
            return FALSE;
        }
        if ( !is_numeric($nTeamUsed) ) {
            add_error('Team Used: '. $nTeamUsed, $key);
            return FALSE;
        }
        if ( !is_numeric($nPowerUnitId) ) {
            add_error('Power Unit id: '. $nPowerUnitId, $key);
            return FALSE;
        }
		$nEquipmentId = intval($nEquipmentId);
        
        if ( !is_numeric($nModeId) ) {
            add_error('Mode id: '. $nModeId, $key);
            return FALSE;
        }
        if ( !is_numeric($nCreatedById) ) {
            add_error('Created By id: '. $nCreatedById, $key);
            return FALSE;
        }
        if ( !is_numeric($nOrderId) ) {
            add_error('Order id: '. $nOrderId, $key);
            return FALSE;
        }
        

        $this->set_carrier_id($nCarrierId);
        $this->set_status_id(1);
        $this->set_accepted(1);
        $this->set_team_used($nTeamUsed);
        $this->set_power_unit_id($nPowerUnitId);
        $this->set_equipment_id($nEquipmentId);
        $this->set_mode_id($nModeId);
        $this->set_created_by_id($nCreatedById);
        $this->set_order_id($nOrderId);
        $this->save();
		
		$nLoadId = $this->get('load_id');
		
		if (!empty($nMovementId)){
			$oMoveToLoad = new MovementToLoad();
			$oMoveToLoad->load(array('movement_id'=> $nMovementId, 'load_id' => $nLoadId));
			$oMoveToLoad->create(array('movement_id'=> $nMovementId, 'load_id' => $nLoadId));
		}
    }
	
	function get_carrier_name(){
		if (!$this->is_loaded()) return "";
		$nCarrierId = $this->get('carrier_id');
		if (empty($nCarrierId)) return "";
		if (!$this->is_connected()) $this->connect();
		
		$s = "SELECT TOP 1 CarrName as carrier_name FROM ContractManager.dbo.CarrierMaster WHERE CarrID = '" . $nCarrierId . "'";
		$res = $this->query($s);
		if ($row = $this->db->fetch_object($res)) return $row->carrier_name;
		
		return "";
	}
}

