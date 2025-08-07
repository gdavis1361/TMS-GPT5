<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_N3 extends Edi_Segments_Abstract {
	public $type = "N3";
	public $AddressInformation1;
	public $AddressInformation2;
	public $map = array(
		"AddressInformation1",
		"AddressInformation2"
	);
}