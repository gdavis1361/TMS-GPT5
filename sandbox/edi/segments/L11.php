<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_L11 extends Edi_Segments_Abstract {
	public $type = "L11";
	public $ReferenceIdentification;
	public $ReferenceIdentificationQualifier;
	public $Description;
	public $map = array(
		"ReferenceIdentification",
		"ReferenceIdentificationQualifier",
		"Description"
	);

}