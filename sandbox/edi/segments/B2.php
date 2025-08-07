<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_B2 extends Edi_Segments_Abstract {
	public $type = "B2";
	public $StandardCarrierAlphaCode;
	public $ShipmentIdentificationNumber;
	public $ShipmentMethodOfPayment;
	public $map = array(
		null,
		"StandardCarrierAlphaCode",
		null,
		"ShipmentIdentificationNumber",
		null,
		"ShipmentMethodOfPayment"
	);
}