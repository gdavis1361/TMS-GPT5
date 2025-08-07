<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

$nId = request('id', '');
$sTable = request('table', '');
$aVars = $_POST;
unset($aVars['table']);

// Failed until proven otherwise.
$aReturn = array('success' => '0', 'errors' => array() );

if (empty($nId) ) { 
	$aReturn['errors'][] = 'Empty Id'; 
}

$aReturn['table_modified'] = $sTable;

switch($sTable){
	case "contact_customer_detail" : $oContact = new ContactCustomerDetail(); break;
	default : $oContact = new ContactBase(); break;
}

if ( !$oContact->load( array('contact_id' => $nId) ) ) {
	if ( empty($sTable) )
		$aReturn['errors'][] = 'Failure to load'; 
	else{
		$oContact->set('contact_id', $nId);
		$oContact->set('status_id', 2); // 2 is Pending for Customer. This probably should be a const somewhere when it is set in stone. 
		$oContact->set('potential_id', 0);
		$oContact->set('call_interval', 0);
		$oContact->set('email_interval', 0);
		$oContact->set('visit_interval', 0);
		$oContact->set('created_by_id', get_user_id()) ;
		$oContact->set('created_at', time());
	}
}

if ( isset($aVars['contact_name']) ) {
	$aVars['contact_name'] = trim($aVars['contact_name']);
	if ( empty($aVars['contact_name']) ) $aReturn['errors'][] = 'Empty Contact Name';
	else{
		$aParts = explode_name($aVars['contact_name']);
		$aVars = array_merge($aVars, $aParts);
		unset($aVars['contact_name']);
	}
}
	
$aVars['updated_at'] = time();
$aVars['updated_by_id'] = get_user_id();

foreach($aVars as $k => $v) {
	
	if ($k != 'id') {
		$oContact->set($k, trim($v));
	}
}

// Only attempt saving if there are no errors. 
if ( empty($aReturn['errors']) ) {
	if ( $oContact->save() ) $aReturn['success'] = "1";
	else $aReturn['errors'][] = "Failed To Save";
}else $aReturn['errors'][] = "Didn't try to Save." ;

echo json_encode($aReturn);

?>