<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_AT5 extends Edi_Segments_Abstract {
	public $type = "AT5";
	public $SpecialHandlingCode;
	public $map = array(
		"SpecialHandlingCode"
	);
}