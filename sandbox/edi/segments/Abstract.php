<?php
abstract class Edi_Segments_Abstract {
	
	/**
	 * Maps index location to property name
	 * @var array
	 */
	public $map = array();
	
	public function __construct($segment = array()){
		$this->load($segment);
	}
	
	public function load($segment){
		foreach ($this->map as $index => $field){
			if(isset($segment[$index]) && property_exists($this, $field)){
				$this->$field = $segment[$index];
			}
		}
	}
}