<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_OID extends Edi_Segments_Abstract {
	public $type = "OID";
	public $PurchaseOrderNumber;
	public $ReferenceIdentification;
	public $WeightUnitCode;
	public $Weight;
	public $VolumeUnitQualifier;
	public $Volume;
	public $map = array(
		null,
		"PurchaseOrderNumber",
		"ReferenceIdentification",
		null,
		null,
		"WeightUnitCode",
		"Weight",
		"VolumeUnitQualifier",
		"Volume"
	);
}