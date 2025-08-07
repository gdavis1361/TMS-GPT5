<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_N7 extends Edi_Segments_Abstract {
	public $type = "N7";
	public $EquipmentNumber;
	public $EquipmentDescriptionCode;
	public $EquipmentLength;
	public $map = array(
		null,
		"EquipmentNumber",
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		null,
		"EquipmentDescriptionCode",
		null,
		null,
		null,
		"EquipmentLength"
	);
}