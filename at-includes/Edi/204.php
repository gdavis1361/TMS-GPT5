<?php
class Edi_204 {
	
	public $xml = '';
	public $xmlObject;
	
	public function __construct($xml) {
		$this->xml = $xml;
		$this->xmlObject = simplexml_load_string($this->xml);
	}
	
	public function getTenders(){
		$tenders = array();
		foreach($this->xmlObject->Tender as $tender){
			$tenders[] = new Edi_Tender($tender);
		}
		
		return $tenders;
	}
}
