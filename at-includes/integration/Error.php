<?php
/**
 * Used as a container to hold a list of Integration_Error objects
 * @author jaredtlewis
 *
 */
class Integration_ErrorList {
	private $_errors = array();
	
	public function addError(Integration_Error $e){
		$this->_errors[] = $e;
	}
	
	public function getErrors(){
		return $this->_errors;
	}
	
	public function anyErrors(){
		if(count($this->_errors)){
			return true;
		}
		return false;
	}
}

/**
 * Holds a message of an error that may occur within the Integration
 * @author jaredtlewis
 *
 */
class Integration_Error {
	private $_message = '';
	
	public function __construct($message = ''){
		$this->_message = $message;
	}
	
	public function getMessage(){
		return $this->_message;
	}
}