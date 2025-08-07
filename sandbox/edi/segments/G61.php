<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_G61 extends Edi_Segments_Abstract {
	public $type = "G61";
	public $ContactFunctionCode;
	public $Name;
	public $CommunicationNumberQualifier;
	public $CommunicationNumber;
	public $map = array(
		"ContactFunctionCode",
		"Name",
		"CommunicationNumberQualifier",
		"CommunicationNumber"
	);
	
}