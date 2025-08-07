<?php 
/**
 * Location to Contact
 *
 * @author Steve Keylon
 */
 
class LocationToContact extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'location_to_contact';

	public function create(	$nLocationId, $nContactId, $nContactPriorityId, $nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nLocationId) ) {
			add_error('LOCATION ID requires a number', $key);
			return false;
		}
		if ( !is_numeric($nContactId) ) {
			add_error('CONTACT ID requires a number', $key);
			return false;
		}
		if ( !empty($nContactPriorityId) && !is_numeric($nContactPriorityId) ) {
			add_error('CONTACT PRIORITY ID requires a number', $key);
			return false;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('CREATED BY ID requires a number', $key);
			return false;
		}
		
		// Save Data
		$this->set_location_id( $nLocationId );
		$this->set_contact_id( $nContactId );
		$this->set_contact_priority_id( $nContactPriorityId );
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}

	public function contact_info_by_location($nLocationId) {
		$this->connect();
		$rs = $this->db->query('
			SELECT * FROM dbo.' . $this->m_sTableName . ' ltc
				LEFT JOIN dbo.contact_priorities cp ON ltc.contact_priority_id = cp.priority_id
				WHERE ltc.location_id = ' . $nLocationId.'
				ORDER BY cp.priority_index ASC' );
		
		$oContact = new ContactBase();
		$oContactMethod = new ContactMethods();
		$aReturn = array();
		while($o = $this->db->fetch_object($rs)){
			$oContact->load($o->contact_id);
			$aMethods = $oContactMethod->list_by_contact_id($o->contact_id);

			//if (isset($aMethods[0])) $sMethod = $aMethods[0];
			$aReturn[ $o->contact_id ] = array(
				'id' => $o->contact_id,
				'name' => $oContact->get_FirstLastName(),
				'first_name' => $oContact->get('first_name'),
				'middle_name' => $oContact->get('middle_name'),
				'last_name' => $oContact->get('last_name'),
				'methods' => $aMethods,
				'location_id' => $nLocationId
			);
		}
		return $aReturn;
	}
	

	public function get_locations_by_contact_id( $nContactId ) {
		$this->where( 'contact_id', '=', $nContactId );
		$aResults = $this->list();
		
		$aReturn = array();
		foreach ( $aResults->rows as $oDatalet ) {
			 $aRet = $oDatalet->get();
			 $oLocationBase = new LocationBase();
			 if ( $aLocationData = $oLocationBase->get_location_by_id( $aRet['location_id'] ) ) {
			 	if ( $aLocationData['active'] == 1 ) {
				 	$aReturn[] = $aLocationData;
				 }
			 }
			 
		}
		return $aReturn;
	}
}
?>