<?php

/**
 * Pre Order Stops To Location
 *
 * @author Steve Keylon
 */

class PreOrderStopToLocation extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'pre_order_stop_to_location';

	public function create(	$nPreOrderStopsId, $nLocationId ) {
		// Validate Data
		if ( !is_numeric($nPreOrderStopsId) ) {
			add_error('Pre Order Stops Id: ' . $nPreOrderStopsId, $key);
			return FALSE;
		}
		if ( !is_numeric($nLocationId) ) {
			add_error('location Id: ' . $nLocationId, $key);
			return FALSE;
		}

		// Insert/Save
		$this->set_pre_order_stops_id($nPreOrderStopsId);
		$this->set_location_id($nLocationId);

		$this->save();

		// Report
		return true;
	}
}

?>