<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_SE extends Edi_Segments_Abstract {
	public $type = "SE";
	public $NumberOfIncludedSegments;
	public $TransactionSetControlNumber;
	public $map = array(
		"NumberOfIncludedSegments",
		"TransactionSetControlNumber"
	);
}