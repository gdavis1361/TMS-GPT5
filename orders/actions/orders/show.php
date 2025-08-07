<?php
$oOrder = new OrderBase();
$oOrder->load($nId);
$nCustomerId = $oOrder->get_customer_id();
$oCustomer = new CustomerBase();
$oCustomer->load($nCustomerId);
$oLoad = new LoadBase();
$oLoad->load(array('order_id' => $nId));

$oCharge = $oOrder->get_charge();
$sCustomerName = $oCustomer->get_customer_name();
$vTeamRequired = $oOrder->get_team_required();
$nOrderedById = $oOrder->get_ordered_by_id();
$nBillToId = $oOrder->get_bill_to_id();
$vBillToCustomer = ($nBillToId == $nCustomerId ? true : false);
$nLineHaulCharge = $oCharge ? $oCharge->get_linehaul_charge() : 0;
$nFuelCharge = $oCharge ? $oCharge->get_fuel_charge() : 0;
$nLinehaulCost = $oCharge ? $oCharge->get('linehaul_cost') : 0;
$nFuelCost = $oCharge ? $oCharge->get('fuel_cost') : 0;
$nAccessorialCost = $oCharge ? $oCharge->get('accessorial_cost') : 0;
//$aCustomerContacts = $oCustomer->get_associated_contacts($oCustomer->get_customer_id());
$aCustomerContacts = $oCustomer->getContacts(ToolsStatusTypes::Hot);
$aOrderDetails = $oOrder->list_details('DESC');
$aOrderEquipment = $oOrder->list_equipment();
$aOrderModes = $oOrder->list_modes();
$aAccessorials = $oOrder->list_accessorials('DESC');
$aOrderStops = $oOrder->get_stops();
$oGoods = new OrderGoods();
$oGoods->load(array('order_id' => $nId));

$nLoadWeight = $oGoods->get('weight_value');
if (!$vBillToCustomer) {
	$oCustomer->load($nBillToId);
	$sBillToName = $oCustomer->get_customer_name();
}
$sCarrierName = $oLoad->get_carrier_name();
$nCarrierId = $oLoad->get('carrier_id');