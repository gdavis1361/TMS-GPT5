<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_N1 extends Edi_Segments_Abstract {
	public $type = "N1";
	public $EntityIdentifierCode;
	public $Name;
	public $IdentificationCodeQualifier;
	public $identificationCode;
	public $map = array(
		"EntityIdentifierCode",
		"Name",
		"IdentificationCodeQualifier",
		"identificationCode"
	);
}