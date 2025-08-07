<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');
// ?q=[CUSTOMER_ID]
// RETURNS CONTACTS RELATED TO CUSTOMER

if ( request('method') == 'ajax') {

    $sQuery       = request('q');
    $aReturnData  = request('return');
    
    $aReturn = array(
        'RESULTS' => array()
    );

    // Pass along return variables
    $aPassback = array();
    if ( is_array($aReturnData) && count($aReturnData) > 0 ) {
	    foreach ( $aReturnData as $k => $v ) {
	    	$aPassback[$k] = $v;
	    }
    }
	
    if ( is_numeric( $sQuery ) ) {

	    $oCustomer2Location = new CustomerToLocation();
	    $oCustomer2Location->where( 'customer_id', '=', $sQuery );
	    $oCustomerLocations = $oCustomer2Location->list();
        // Get Company Locations
	    foreach ( $oCustomerLocations->rows as $oRow ) {
            $aLocationId = $oRow->location_id;

			// Find Contacts Related to those locations
			$oLocation2Contact = new LocationToContact();
			$aContacts = $oLocation2Contact->contact_info_by_location( $aLocationId );
			
			foreach ( $aContacts as $aContact ) {
				$aReturn['RESULTS'][] = array(
					'DATA' => array(
						'ID' => $aContact['id'],
						'NAME' => $aContact['name'],
						'FIRST_NAME' => $aContact['first_name'],
						'MIDDLE_NAME' => $aContact['middle_name'],
						'LAST_NAME' => $aContact['last_name']
					),
					'PASS' => $aPassback
				);
			}
	    }
	    
    } else {
    	$aReturn['ERRORS'][] = 'Query `q` was not a number';
    }
    
    echo( json_encode( $aReturn ) );
}
?>