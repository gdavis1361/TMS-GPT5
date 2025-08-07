<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_S5 extends Edi_Segments_Abstract {
	public $type = "S5";
	public $StopSequenceNumber;
	public $StopReasonCode;
	public $Weight;
	public $WeightUnitCode;
	public $Volume;
	public $VolumeUnitQualifier;
	public $map = array(
		"StopSequenceNumber",
		"StopReasonCode",
		"Weight",
		"WeightUnitCode",
		null,
		null,
		"Volume",
		"VolumeUnitQualifier",
	);
}