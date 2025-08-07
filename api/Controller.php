<?php
class Api_Controller {
	private $module = 'api';
	private $table = '';
	private $method = '';
	private $request = array();
	private $good = true;
	private $errors = array();
	private $result = '';
	
	public function run(){
		//Parse the request
		$this->parseRequest();
		
		//Be sure we catch all errors
		$this->startErrorHandling();
		
		//Try to run the method
		$class = $this->getClass();
		if(class_exists($class, true)){
			$method = $this->getMethod();
			
			//Create the class and call the function
			$table = new $class();
			
			//Try to call the method, catch any exceptions and return them to the user
			try {
				$this->result = call_user_func_array(array($table, $method), $this->getArguments());
			}
			catch (Exception $e){
				$this->addError($e->getMessage());
			}
		}
	}
	
	public function showResponse(){
		echo json_encode($this->getResponse());
	}
	
	public function getResponse(){
		return array(
			"good" => $this->good,
			"errors" => $this->errors,
			"result" => $this->result
		);
	}
	
	public function addError($message){
		$this->good = false;
		$this->errors[] = $message;
	}
	
	public function endErrorHandleing(){
		restore_error_handler();
	}
	
	public function startErrorHandling(){
		set_error_handler(array($this, "handleError"));
	}
	
	public function handleError($errno, $errstr, $errfile, $errline, array $errcontext){
	    // error was suppressed with the @-operator
	    if (0 === error_reporting()) {
	        return false;
	    }
	
	    throw new ErrorException($errstr, 0, $errno, $errfile, $errline);
	}
	
	public function getTable(){
		return str_replace("-", "_", $this->table);
	}
	
	public function getClass(){
		$classParts = explode("-", $this->table);
		$class = '';
		foreach ($classParts as $part){
			$class .= ucfirst($part);
		}
		
		return $class;
	}
	
	public function getMethod(){
		return $this->method;
	}
	
	public function getArguments(){
		if(isset($this->request['arguments'])){
			return $this->request['arguments'];
		}
		
		return array();
	}
	
	public function getRow(){
		if(isset($this->request['row'])){
			return $this->request['row'];
		}
		
		return array();
	}
	
	public function parseRequest($request = false){
		//Reset Defaults
		$this->module = 'api';
		$this->table = '';
		$this->method = '';

		if($request === false){
			$request = $_SERVER['REQUEST_URI'];
		}
		$request = trim($request, '/');
		$request = explode('/', $request);
		$toSplice = array();

		//Parse out any query strings
		foreach ($request as $key => $str){
			$q = explode('?', $str);

			//There was a query string
			if(count($q) >= 2){
				//was appended to subpage title /pagetitle?
				if(strlen($q[0])){
					$request[$key] = $q[0];
				}
				//Was appended after a slash "/pagetitle/?"
				else{
					$toSplice[] = $key;
				}

				//Merge the query string with the get array
				$this->mergeGet($q[1]);
			}
		}

		//Splice any that need to be removed
		foreach ($toSplice as $count => $key){
			array_splice($request, $key-$count, 1);
		}


		$requestCount = count($request);
		$extraParams = $request;
		$requestArray = $request;

		//module and action
		if($requestCount >= 3){
			$this->module = strtolower($request[0]);
			$this->table = strtolower($request[1]);
			$this->method = strtolower($request[2]);
			array_shift($extraParams);
			array_shift($extraParams);
			array_shift($extraParams);
		}
		else if ($requestCount == 2){
			$this->module = strtolower($request[0]);
			$this->method = strtolower($request[1]);
			array_shift($extraParams);
			array_shift($extraParams);
		}
		//just module
		else if($requestCount == 1 && strlen($request[0])){
			$this->module = strtolower($request[0]);
			array_shift($extraParams);
		}

		//Create get vars from url extras
		$keys = array();
		$values = array();
		$getString = '';
		for($i = 0; $i < count($extraParams); $i++){
			//Check for the question mark variables
			$firstChar = substr($extraParams[$i], 0, 1);
			if($firstChar == '?'){
				$getString = $extraParams[$i];
			}
			else{
				if($i%2){
					$values[] = $extraParams[$i];
				}
				else{
					$keys[] = $extraParams[$i];
				}
			}
		}

		for ($i = 0; $i < count($keys); $i++){
			$key = $keys[$i];
			$value = '';
			if(isset($values[$i])){
				$value = $values[$i];
			}
			if(strlen($key)){
				$_GET[$key] = $value;
			}
		}

		//Recompile the correct $_GET array if a ? is used
		$q = trim(end(explode('/', $getString)), '/?');
		$this->mergeGet($q);
		
		//get the request json string
		if(isset($_REQUEST['request'])){
			$this->request = json_decode($_REQUEST['request'], true);
		}

		return array(
			"module" => $this->module,
			"table" => $this->table,
			"method" => $this->method
		);
	}
	
	public function mergeGet($queryString){
		parse_str($queryString, $getMerge);
		$_GET = array_merge($_GET, $getMerge);
	}
}