<?php
die();
if ($nId) {
	$oPreOrder = new PreOrderBase();
	$oPreOrder->load($nId);
	$oOrder = $oPreOrder->convert_to_order();
	if ($oOrder) {
		redirect('/orders/?d=orders&a=show&id=' . $oOrder->get('order_id'));
	}
	else {
		redirect('/orders/?d=quotes');
	}
}
die();