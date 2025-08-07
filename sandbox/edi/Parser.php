<?php
class Edi_Parser {
	private $_delimiter;
	private $_lines = array();
	private $_segmentArrays = array();
	private $_segments = array();
	private $_segmentTypes = array();
	
	public function __construct($delimiter = "*"){
		$this->_delimiter = $delimiter;
	}
	
	public function setDelimiter($delimiter){
		$this->_delimiter = $delimiter;
	}
	
	private function reset(){
		$this->_lines = array();
		$this->_segmentArrays = array();
		$this->_segmentTypes = array();
	}
	
	public function parse($text){
		//Clear out some arrays
		$this->reset();
		
		//Split and get all lines of this request
		$this->_lines = preg_split("/[\n\r\\\]/i", $text);
		
		//Loop through each part and split on the delimiter
		foreach ($this->_lines as $line){
			$segment = explode($this->_delimiter, $line);
			$this->_segmentArrays[] = $segment;
		}
		
		//pre($this->_segmentArrays);
		
		//Loop through each segmentArray and create the segments
		foreach ($this->_segmentArrays as $segmentArray){
			//First index is the type
			$type = array_shift($segmentArray);
			
			//Try to load this types class
			$class = null;
			if(file_exists(dirname(__FILE__) . "/segments/$type.php")){
				//Require this file
				require_once dirname(__FILE__) . "/segments/$type.php";
				$className = "Edi_Segments_$type";
				$class = new $className($segmentArray);
			}
			
			//Push the class onto the segments array, even if its null
			$this->_segments[] = $class;
			
			//Map this segment by type
			if(!isset($this->_segmentTypes[$type])){
				$this->_segmentTypes[$type] = array();
			}
			$this->_segmentTypes[$type][] = $class;
		}
		
		pre($this->_segments);
	}
}