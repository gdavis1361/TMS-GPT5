<?php 
/**
 * Customer to Shippping Location
 *
 * @author Steve Keylon
 */

class CustomerToShippingLocation extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'customer_to_shipping_location';

	public function create( $nCustomerId, $nLocationId, $nOrigin, $nDefaultAddress, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nDefaultAddress) ) return FALSE;
		if ( !is_numeric($nOrigin) ) return FALSE;
		if ( !is_numeric($nLocationId) ) return FALSE;
		if ( !is_numeric($nCustomerId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_default_address($nDefaultAddress);
		$this->set_origin($nOrigin);
		$this->set_location_id($nLocationId);
		$this->set_customer_id($nCustomerId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time()); 
		$this->save();
		// Report
		return;
	}
	
	function get_locations_by_customer_id( $nCustomerId ) {
		if ( !is_numeric($nCustomerId) ) return FALSE;

		$aReturn = array();

		$this->where( 'customer_id', '=', $nCustomerId );
		$oRes = $this->list();
		$aRows = $oRes->rows;
		if ( count($aRows) > 0 ) {
			foreach ( $aRows as $oRow ) {
				$aReturn[] = $oRow->get();
			}
		}
		return $aReturn;
	}
}
?>