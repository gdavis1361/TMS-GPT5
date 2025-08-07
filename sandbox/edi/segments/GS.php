<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_GS extends Edi_Segments_Abstract {
	public $type = "GS";
	public $FunctionalIdentifierCode;
	public $ApplicationSenderCode;
	public $ApplicationReceiverCode;
	public $Date;
	public $Time;
	public $GroupControlNumber;
	public $ResponsibleAgencyCode;
	public $IndustryIdentifierCode;
	
	public $map = array(
		"FunctionalIdentifierCode",
		"ApplicationSenderCode",
		"ApplicationReceiverCode",
		"Date",
		"Time",
		"GroupControlNumber",
		"ResponsibleAgencyCode",
		"IndustryIdentifierCode",
	);
}