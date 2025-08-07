<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_ST extends Edi_Segments_Abstract {
	public $type = "ST";
	public $TransactionSetIdentifierCode;
	public $TransactionSetControlNumber;
	public $map = array(
		"TransactionSetIdentifierCode",
		"TransactionSetControlNumber"
	);
}