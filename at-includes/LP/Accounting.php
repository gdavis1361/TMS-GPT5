<?php

class LP_Accounting {

	private $client; 
	
	public function __construct() {
		$this->client = new SoapClient('http://192.168.10.115/solomonws/solomonwsi.asmx?wsdl');
	}
	
	public function test(){
		$priority = AccountingPriority::CustomerImport;
		$screenNbr = AccountingScreenNumber::CustomerMaintenance;
		pre( $this->client->PutDataPriority(array(
			'Element' => '',
			'ScreenNbr' => $screenNbr,
			'XSLFileName' => '', //Optional?
			'Priority' => $priority
		)) );
	}
	
	public function prepareTransaction(){
		$s = '<transaction xmlns="">
		</transaction>';
	}
}
?>
