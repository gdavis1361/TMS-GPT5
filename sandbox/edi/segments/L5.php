<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_L5 extends Edi_Segments_Abstract {
	public $type = "L5";
	public $LadingDescription;
	public $map = array(
		null,
		"LadingDescription"
	);
}