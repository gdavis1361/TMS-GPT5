<?php

/**
 * OrderToMovement Base
 *
 * @author Nick Romano
 *
 */

class OrderToMovement extends DBModel {

    var $m_sClassName = __CLASS__;
    var $m_sTableName = 'order_to_movement';
    
    public function create( 
                           $nOrderId,
                           $nStopIndex, 
                           $nMovementId, 
                           $nUserId
                          ) 
    {
    	// set the db table to update
        //$this->$m_sTableName = 'order_to_movement';
        
        $key = __CLASS__ . '::' . __METHOD__;
        
        // verify that all params are type (int)
        foreach(func_get_args() as $arg)
        {
            if ( !is_numeric($arg) ) 
            {
                add_error('id: '. $arg, $key);
                return FALSE;
            }
            else 
            {
            	//echo $arg.'<br />';
            }
        }
       
        $now = date(time());
        
        // populate the table 
        $this->set_order_id($nOrderId);
        $this->set_stop_index($nStopIndex);
        $this->set_movement_id($nMovementId);
        $this->set_direction_flag(1);
        $this->set_created_by_id($nUserId);
        $this->set_created_at($now);
        //$this->set_updated_by($nUserId);
        //$this->set_updated_at($now)
        $this->save();
    }
}

