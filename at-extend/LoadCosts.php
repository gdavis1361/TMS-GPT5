<?php

/**
 * Load Base
 *
 * @author Steve Keylon
 *
 */

class LoadBase extends DBModel {

    var $m_sClassName = __CLASS__;
    var $m_sTableName = 'load_costs';

    public function create( $nFuelCost,
                            $nAccessorialCost, 
                            $nBaseCost, 
                            $nCreatedById) {

        $key = __CLASS__ . '::' . __METHOD__;
        
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
        if ( !is_numeric($nEquipmentId) ) {
            add_error('Equipment id: '. $nEquipmentId, $key);
            return FALSE;
        }
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
        
		
        
        return $this->save();
	}
}