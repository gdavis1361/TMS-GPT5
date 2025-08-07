<?php

class Carrier_AuditController extends AjaxController {

	public function approveAction() {
		$carrierId = intval(getParam('carrier_id', 0));
		$carrierBaseExtended = new CarrierBaseExtended($carrierId);
		$carrierBaseExtended->approve();
	}
	
	public function declineAction() {
		$carrierId = intval(getParam('carrier_id', 0));
		$carrierBaseExtended = new CarrierBaseExtended($carrierId);
		$carrierBaseExtended->decline();
	}
	
}