<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_IEA extends Edi_Segments_Abstract {
	public $type = "IEA";
	public $NumberOfIncludedGroups;
	public $InterchangeControlNumber;
	public $map = array(
		"NumberOfIncludedGroups",
		"InterchangeControlNumber"
	);
}