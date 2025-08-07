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
    
	$oCarriers = new CarrierBase();
	$aCarriers = $oCarriers->search_carriers( $sQuery );

    foreach ( $aCarriers as $nCarrierId ) {
		$oCarrier = $oCarriers->get_carrier_by_id( $nCarrierId );
		//pre($oCarrier);
    	$aReturn['RESULTS'][] = array(
            'HTML' => '<strong>'.$oCarrier->CarrName.'</strong><br/>'.((strlen(trim($oCarrier->CarrCorpCity))>0)? trim($oCarrier->CarrCorpCity).', ': '' ).((strlen(trim($oCarrier->CarrCorpState))>0)? trim($oCarrier->CarrCorpState).'<br>': '' ).'MC'.$oCarrier->mc_no,
            'COMPLETE' => $oCarrier->CarrName,
            'DATA' => array(
                'ID' => $oCarrier->CarrID
            ),
    		'PASS' => $aPassback
        );
    }

    
    die( json_encode( $aReturn ) );
}
?>