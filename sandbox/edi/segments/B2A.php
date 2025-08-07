<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_B2A extends Edi_Segments_Abstract {
	public $type = "B2A";
	public $TransactionSetPurposeCode;
	public $ApplicationType;
	public $map = array(
		"TransactionSetPurposeCode",
		"ApplicationType"
	);
}