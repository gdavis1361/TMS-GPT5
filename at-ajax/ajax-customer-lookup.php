<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');

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
    
    $oCustomer = new CustomerBase();
    $oCustomer->where( 'lower(customer_name)', 'LIKE', addslashes( strtolower($sQuery) ) );
    $o = $oCustomer->list();
    foreach ( $o->rows as $oRow ) {
    	$aReturn['RESULTS'][] = array(
            'HTML' => '<strong>'.html_entity_decode($oRow->get('customer_name'), ENT_QUOTES).'</strong>',
            'COMPLETE' => html_entity_decode($oRow->get('customer_name'), ENT_QUOTES),
            'DATA' => array(
                'ID' => $oRow->get('customer_id'),
                'NAME' => html_entity_decode($oRow->get('customer_name'), ENT_QUOTES)
            ),
    		'PASS' => $aPassback
        );
    }

    
    die( json_encode( $aReturn ) );
}
?>