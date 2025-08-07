<?php
$sPage = 'orders';

$order = new OrderBase();
$order->load($nId);
$nOldStatus = $order->get('status_id');

$order->doOrder($nId, $nCustomerId, $nOrderedById, $nUserId, $vIsQuote, $vIsContractedRate, $vIsPost, $vTeamRequired, $nFuelCharge, $nLineHaulCharge, $aAccessorials, $nBillToId, $sOrderComment, $aOrderDetails, $aEquipmentAllowed, $aModesAllowed, $aStops, $nStatusId);

if ($nStatusId == ToolsStatusTypes::OrderAvailable && $nOldStatus !== ToolsStatusTypes::OrderAvailable){
	$nCarrierId = 0;
	$nCarrierContactId = null;
	$nEquipmentId = 0;
	$nLinehaulCost = 0;
	$nFuelCost = 0;
	$nAccessorialCost = 0;
}


$oLoad = new LoadBase();
$oLoad->load( array('order_id' => $nId ) );

$oLoad->create( $nCarrierId, 0, 0, $nEquipmentId, 0, 0, get_user_id(), $nId);
$oLoad->set('contact_id', $nCarrierContactId);
if ($nOldStatus == ToolsStatusTypes::OrderAvailable && $nCarrierId) {
	$order->set('status_id', ToolsStatusTypes::OrderCovered);
	$order->save();
}
$oLoad->save();

if ($nId) {
	$oGoods = new OrderGoods();
	$oGoods->load(array('order_id' => $nId));
	$params = array(
		'order_id' => $nId,
		'weight' => $nLoadWeight,
		'desc' => $sGoodsDescription
	);
	$oGoods->create($params);
	
	pre($params);
	print_errors();
	info();
	die();
	
	$oCharge = new OrderCharge();
	if (!$oCharge->load(array('order_id' => $nId))) {
		$oCharge->create($nId, 0, 0, 0, $nFuelCost, $nLinehaulCost, $nAccessorialCost, get_user_id());
	}
	$oCharge->set_costs($nFuelCost, $nLinehaulCost, $nAccessorialCost);
	$oCharge->save();
}

$order = new OrderBase();
$order->load($nId);
$order->checkTasks();