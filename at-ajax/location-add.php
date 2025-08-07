<?php

require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');

//pre($_POST); die();

$nCarrierTypeId = 3;
$nPayToTypeId = 5;
$aCarrierType = array($nCarrierTypeId, $nPayToTypeId);

$nCustomerTypeId = 2;
$nBillToTypeId = 4;
$aCustomerType = array($nCustomerTypeId, $nBillToTypeId);

$sName1 = request('name1', '');
$sName2 = request('name2', '');
$sAddress1 = request('address1', '');
$sAddress2 = request('address2', '');
$sAddress3 = request('address3', '');
$sCity = request('city', '');
$sState = request('state', '');
$sZip = request('zip', '');
$sSeq = request('seq', 1);

$nMcNumber = request('mc_no', '000000');
$aPaymentType = request('payment_type', array());
$sSafetyRating = request('safety_rating', '');
$sSafetyRatingDate = request('safety_date', 'C');
$nCommonAuthority = request('common_auth', 'N');
$sContractAuthority = request('contract_auth', 'N');
$sBrokerAuthority = request('broker_auth', 'N');

$nCompanyId = request('company_id', 0);
$nContactTypeId = request('contact_type_id', 0);
$nCreatedById = get_user_id();
$aUsedModes = request('used_modes', array());
$aEquipment = request('allowed_equipment', array());

$o = new LocationBase();
$vLocation = $o->create($sName1, $sName2, $sAddress1, $sAddress2, $sAddress3, $sZip, $sSeq, $nCreatedById);
$nLocationId = $o->get('location_id');

foreach ($aUsedModes as $mode){
	$o->add_mode($mode);
}

if($nCompanyId){
	if ($nContactTypeId == $nCarrierTypeId) {
		$oRelation = new LocationToCarriers();
		$oRelation->create($o->get('location_id'), $nCompanyId, $nCreatedById);
		die(json_encode(array('id' => $o->get('location_id'))));
	}
	else if ($nContactTypeId == $nCustomerTypeId) {
		$oRelation = new CustomerToLocation();
		$a = array();
		$a['customer_id'] = $nCompanyId;
		$a['location_id'] = $o->get('location_id');
		$oRelation->create($a);
	}
	echo json_encode(array(
		'id' => $o->get('location_id'),
		'name' => $o->get('location_name_1')
	));
	die();
}

if ($nContactTypeId == $nCarrierTypeId) {
	$oCarrier = new CarrierBase();
	$oCarrier->create($sName1, $nMcNumber, $sSafetyRating, $sSafetyRatingDate, $nCommonAuthority, $sContractAuthority, $sBrokerAuthority, $nCreatedById);
	$oRelateLocation = new LocationToCarriers();
	$nCarrierId = $oCarrier->get('carrier_id');

	$oRelateLocation->create($nLocationId, $nCarrierId, $nCreatedById);
	// Start Monitoring MC Number.
}
else if ($nContactTypeId == $nCustomerTypeId) {
	$customer['customer_name'] = empty($sName1) ? $sName2 : $sName1;
	$customer['managed_by_id'] = get_user_id();
	$customer['industry_id'] = 0; //SHOULD WE ASK FOR AN INDUSTRY ID?
	$customer['location_id'] = $o->get('location_id');
	if (empty($customer['location_id']))
		unset($customer['location_id']);

	$oCustomer = new CustomerBase();
	$oCustomer->create($customer);

	$oTask = new TaskBase();

	$oUser = new UserBase();
	$sCustomerName = $oCustomer->get('customer_name');

	$nTaskTypeId = 12; //New Customer needs billing attention
	$nEmployeeId = $oCustomer->get_next_billing_id();
	$nDueAt = time();
	$aTaskDetails = array('customer_id' => $oCustomer->get('customer_id'),
		'customer_name' => $oCustomer->get('customer_name')
	);
	$nCreatedById = get_user_id();
	$oTask->create($nTaskTypeId, $nEmployeeId, $nDueAt, $aTaskDetails, $nCreatedById);
}

echo json_encode(array(
	'id' => $nLocationId
));
?>