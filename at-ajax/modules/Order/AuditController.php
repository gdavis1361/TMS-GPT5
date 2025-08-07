<?php

class Order_AuditController extends AjaxController {

	public function approveAction() {
		$orderId = intval(getParam('order_id', 0));
		$orderBase = new OrderBase($orderId);
		$orderBase->approveAudit();
	}
	
	public function denyAction() {
		$orderId = intval(getParam('order_id', 0));
		$orderBase = new OrderBase($orderId);
		$orderBase->denyAudit();
	}
	
	public function fixOrderDetailsAction() {
		$orderId = intval(getParam('order_id', 0));
		$orderBase = new OrderBase($orderId);
		$orderBase->fixOrderDetails();
	}
	
	public function completeInvoiceAction() {
		$orderId = intval(getParam('order_id', 0));
		$orderBase = new OrderBase($orderId);
		$orderBase->completeInvoice();
	}
	
	public function markAsCollectedAction() {
		$orderId = intval(getParam('order_id', 0));
		$orderBase = new OrderBase($orderId);
		$orderBase->markAsCollected();
	}
	
}