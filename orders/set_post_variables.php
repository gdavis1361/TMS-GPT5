<?php
$nId = intval(getParam('id'));
$nUserId = get_user_id();
$nStatusId = getPostParam('status_id', ToolsStatusTypes::OrderAvailable);
$nCustomerId = getPostParam('customer_id', 0);
$sCustomerName = getPostParam('customer_name', '');
$vBillToCustomer = false;
if (isset($_POST['bill_to_customer'])) {
	$vBillToCustomer = true;
}
$nBillToId = $nCustomerId;
if (!$vBillToCustomer) {
	$nBillToId = getPostParam('bill_to_id', 0);
}

$nOrderedById = getPostParam('ordered_by_id', 0);
$vTeamRequired = (bool) request('team_required', false);
$vIsContractedRate = (bool) request('contracted_rate', false);
$vIsPost = (bool) request('is_post', false);
$vIsQuote = (bool) request('is_quote', false);

$nLoadWeight = getPostParam('load_weight', 0);
$nEquipmentId = getPostParam('used_equipment_id', 0);
$nCarrierContactId = getPostParam('carrier_contact_id', 0);

$aOrderDetailsValue = getPostParam('order_detail', array());
$aOrderDetailsType = getPostParam('order_detail_type', array());

$aOrderDetails = array();
foreach ($aOrderDetailsType as $k => $v) {
	$aOrderDetails[] = array(
		"type" => $v,
		"value" => $aOrderDetailsValue[$k]
	);
}

$aModesAllowed = request('modes_allowed', array());
if (isset($_POST['modesAllowed'])) {
	$aModesAllowed = explode(",", trim($_POST['modesAllowed'][0], ","));
}

$aEquipmentAllowed = request('allowed_equipment', array());
if (isset($_POST['equipmentAllowed'])) {
	$aEquipmentAllowed = explode(",", trim($_POST['equipmentAllowed'][0], ","));
}

$sOrderComment = trim(request('order_comment'));


//Set the stops the new way
if (isset($_POST['stops'])) {
	$aStops = json_decode(urldecode($_POST['stops']), true);
}

$aChargeTypes = request('accessorial_charge_type', array());
$aChargeAmount = request('accessorial_charge_amount', array());
$aChargeCount = request('accessorial_charge_count', array());
$aAccessorialId = request('accessorial_id', array());
$aBillToId = request('accessorial_bill_to_id', array());
$aBillSeparate = request('bill_separate', array());

$nFuelCharge = getPostParam('fuel_charge', 0);
$nLineHaulCharge = getPostParam('linehaul_charge', 0);

$aAccessorials = array();

foreach ($aChargeTypes as $k => $v) {
	if ( !isset($aBillSeparate[$k]) || !is_numeric($aBillSeparate[$k]) ) {
		$aBillSeparate[$k] = 0;
	}
	if ( !isset($aBillToId[$k]) || !is_numeric($aBillToId[$k])) {
		$aBillToId[$k] = 0;
	}
	$aAccessorials[] = array(
		'id' => $aAccessorialId[$k],
		'type_id' => $aChargeTypes[$k],
		'per_unit' => $aChargeAmount[$k],
		'unit_count' => $aChargeCount[$k],
		'bill_to_id' => $aBillToId[$k],
		'bill_separate' => $aBillSeparate[$k]
	);
}

$sGoodsDescription = request('goods_desc', '');


$nCarrierId = getPostParam('carrier_id', getPostParam('cid', 0));

$nLinehaulCost = getPostParam('linehaul_cost', 0);
$nFuelCost = getPostParam('fuel_cost', 0);
$nAccessorialCost = getPostParam('accessorial_cost', 0);

//$nEquipId = request('equipment_type', 0);
//$nModeId = request('mode_type', 0);

$nFuelCost = trim($nFuelCost, " $");
$nAccessorialCost = trim($nAccessorialCost, " $");
$nLinehaulCost = trim($nLinehaulCost, " $");

$nLinehaulCost = floatval($nLinehaulCost);
$nFuelCost = floatval($nFuelCost);
$nAccessorialCost = floatval($nAccessorialCost);