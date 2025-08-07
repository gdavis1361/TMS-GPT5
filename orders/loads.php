<?php
require_once($_SERVER['DOCUMENT_ROOT'] . '/at-includes/engine.php');
require_once($_SERVER['DOCUMENT_ROOT'] . '/resources/functions.php');


$sAction = request('a', request('action', '') ) ;
$sDisplay = request('d', request('display', 'list') ) ;
$nOrderId = request('order_id');
$nCarrierId = request('carrier_id', request('cid'));
$nContactId = request('contact_id', 0);
$nEquipmentId = $nEquipId = request('equipment_id', 0);

$nLinehaulCost = request('linehaul_cost', 0);
$nFuelCost = request('fuel_cost', 0);
$nAccessorialCost = request('accessorial_cost', 0);
//$nEquipId = request('equipment_type', 0);
//$nModeId = request('mode_type', 0);

$nFuelCost = trim($nFuelCost, " $");
$nAccessorialCost = trim($nAccessorialCost, " $");
$nLinehaulCost = trim($nLinehaulCost, " $");

$nLinehaulCost = floatval($nLinehaulCost);
$nFuelCost = floatval($nFuelCost);
$nAccessorialCost = floatval($nAccessorialCost);


switch($sAction){
	case "carrier":
		if (empty($nOrderId) || empty($nCarrierId)) header('Location: /orders/');
		
		//error_log($s);
		$oLoad = new LoadBase();
		if ( !$oLoad->load( array('order_id'=>$nOrderId) ) ){
			$oLoad->create($nFuelCost, $nAccessorialCost, $nLinehaulCost, get_user_id());
		}
		$oLoad->set('carrier_id', $nCarrierId);
		$oLoad->set('contact_id', $nContactId);
		$oLoad->set('equipment_id', $nEquipmentId);
		$oLoad->save();
		
		$oLoad->save();
		
		$oOrder = new OrderBase();
		$oOrder->load($nOrderId);
		
		$nCurrentStatus = $oOrder->get('status_id');
		
		if ( $nCurrentStatus == ToolsStatusTypes::OrderAvailable ) {
			$oOrder->set('status_id', ToolsStatusTypes::OrderCovered );
			$oOrder->save();
		}
		
		$oCharge = new OrderCharge();
		if (!$oCharge->load( array('order_id' => $nOrderId) )) $oCharge->create ($nOrderId, 0, 0, 0, $nFuelCost, $nLinehaulCost, $nAccessorialCost, get_user_id());
		$oCharge->set_costs($nFuelCost, $nLinehaulCost, $nAccessorialCost);
		$oCharge->save();
		
		//header('Location: /orders/?d=orders&a=show&id=' . $nOrderId);
		
		break;
	case "edit":
		
		break;
	default:
		
		break;
}


print_errors();


switch($sDisplay){
	case "add":
		
		break;
	case "edit":
		
		break;
	case "add_success":
		header('Location: /orders/?d=orders&a=show&id=' . $nOrderId);
	default:
		
		break;
}