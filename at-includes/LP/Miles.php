<?php

/**
 * Miles
 *
 * @author skeylon
 */
class LP_Miles {
	
	public static function getZiptoZip($nOriginZip, $nDestZip){
		
		require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/Mileage/Access_Google.php');
		
		$params = array('Move' => array(
				'start' => array('zip' => intval($nOriginZip)), 
				'end' => array('zip' => intval($nDestZip)),
				'mode' => array('Normal')
			)
		);
		
		$o = new Access_Google();
		$return = json_decode( $o->sendRequest(json_encode($params)) );
		pre($return);
		die();
		$miles = $return->Google->Move->distance;
		
		$miles = intval(preg_replace('/[^0-9]/', '', $miles));
		
		return $miles;
	}
}