<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_G62 extends Edi_Segments_Abstract {
	public $type = "G62";
	public $DateQualifier;
	public $Date;
	public $TimeQualifier;
	public $Time;
	public $TimeCode;
	public $map = array(
		"DateQualifier",
		"Date",
		"TimeQualifier",
		"Time",
		"TimeCode"
	);
}