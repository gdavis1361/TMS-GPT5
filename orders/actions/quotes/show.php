<?php
$resourceManager = LP_ResourceManager::getInstance();
$resourceManager->addJs('http://maps.google.com/maps/api/js?sensor=false');

$nPreOrderId = $nId;
$oPreOrder = new PreOrderBase();
$oCustomer = new CustomerBase();
$oPreOrder->load($nId);
$nCustomerId = $oPreOrder->get_customer_id();
$oCustomer->load($nCustomerId);

$oCharge = $oPreOrder->get_charge();
$sCustomerName = $oCustomer->get_customer_name();
$vTeamRequired = $oPreOrder->get_team_required();
$vIsContractedRate = $oPreOrder->get_is_contracted_rate();
$vIsPost = $oPreOrder->get_is_post();
$vIsQuote = $oPreOrder->get_is_quote();
$nOrderedById = $oPreOrder->get_ordered_by_id();
$nBillToId = $oPreOrder->get_bill_to_id();
$vBillToCustomer = ($nBillToId == $nCustomerId ? true : false);
$nLineHaulCharge = $oCharge ? $oCharge->get_linehaul_charge() : 0;
$nFuelCharge = $oCharge ? $oCharge->get_fuel_charge() : 0;
$aCustomerContacts = $oCustomer->get_associated_contacts($oCustomer->get_customer_id());
$aPreOrderDetails = $oPreOrder->list_details('DESC');
$aPreOrderEquipment = $oPreOrder->list_equipment();
$aPreOrderModes = $oPreOrder->list_modes();
$aAccessorials = $oPreOrder->list_accessorials('DESC');
$aPreOrderStops = $oPreOrder->get_stops();
if (!$vBillToCustomer) {
	$oCustomer->load($nBillToId);
	$sBillToName = $oCustomer->get_customer_name();
}
$aStopIds = array();
foreach ($aPreOrderStops as $stop) {
	$nStopId = $stop->get('pre_order_stops_id');
	$aStopIds[] = $nStopId;
}

$aStopInstructions = array();
$s = "SELECT instruction.*, type.instruction_type_name 
	FROM pre_order_stop_instructions instruction
	LEFT JOIN tms.dbo.tools_instruction_types type ON type.instruction_type_id = instruction.instruction_type_id
	WHERE instruction.pre_order_id = '" . $nPreOrderId . "'";

$res = $oDB->query($s);

while ($row = $oDB->db->fetch_object($res)) {
	$aStopInstructions[] = $row;
}