<?php

/**
 * Movement Base
 *
 * @author Steve Keylon
 */

class MovementBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'movement_base';

	public function create( $nOriginIndex,
							$nDestinationIndex,
							$nOrderId,
							$nCreatedById
						) {

		$key = __CLASS__ . '::' . __METHOD__;

		// Validate input
		if ( !is_numeric($nOriginIndex) ) {
			add_error('Origin Index: ' . $nOriginIndex, $key);
			return FALSE;
		}
		if ( !is_numeric($nDestinationIndex) ) {
			add_error('Destination Index: ' . $nDestinationIndex, $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return FALSE;
		}
		$sDepartureTime = null;
		$sArrivalTime = null;
		
		// Save Input
		$this->set('origin_index', $nOriginIndex);
		$this->set('destination_index', $nDestinationIndex);
		$this->set('status', 1);
		$this->set('departure_time', $sDepartureTime);
		$this->set('arrival_time', $sArrivalTime);


		$nCreatedId = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at( time() );
		}

		$this->save();
		
		$oRelation = new OrderToMovement();
		$oRelation->load( array('order_id' => $nOrderId, 'movement_id' => $this->get('movement_id')) );
		$oRelation->create($nOrderId, '0', $this->get('movement_id'), $nCreatedById);

		// Report
		return true;
	}
	
	public static function list_by_order($nOrderId){
		$s = "SELECT move.*, m2l.load_id FROM movement_base move
			JOIN order_to_movement o2m ON o2m.movement_id = move.movement_id
			JOIN movement_to_load m2l ON m2l.movement_id = move.movement_id
			WHERE o2m.order_id = '" . $nOrderId . "'";
		$o = new DBModel();
		$o->connect();
		$res = $o->query($s);
		$a = array();
		while ($row = $o->db->fetch_object($res)) $a[$row->movement_id] = $row;
		
		return $a;
	}
}

?>