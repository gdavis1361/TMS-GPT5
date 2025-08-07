<?php
require_once dirname(__FILE__) . '/Abstract.php';

class Edi_Segments_N4 extends Edi_Segments_Abstract {
	public $type = "N4";
	public $CityName;
	public $StateProvinceCode;
	public $PostalCode;
	public $CountryCode;
	public $map = array(
		"CityName",
		"StateProvinceCode",
		"PostalCode",
		"CountryCode"
	);
}