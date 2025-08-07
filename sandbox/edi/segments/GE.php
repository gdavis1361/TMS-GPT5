<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_GE extends Edi_Segments_Abstract {
	public $type = "GE";
	public $NumberOfTransactionSetsIncluded;
	public $GroupControlNumber;
	public $map = array(
		"NumberOfTransactionSetsIncluded",
		"GroupControlNumber"
	);
}