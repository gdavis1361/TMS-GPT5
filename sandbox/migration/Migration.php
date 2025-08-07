<?php
class Migration_Actions {
	const Contacts = 'contacts';
	const Customers = 'customers';
	const Locations = 'locations';
	const Payees = 'payees';
	const Users = 'users';
	const Orders = 'orders';
}

class Migration {
	/**
	 * @var Migration
	 */
	private static $_instance;
	private $_server = '192.168.10.100';
	private $_user = 'smedlin';
	private $_password = 'aatbham';
	private $_database = 'lme76';
	//private $_server = '192.168.10.115';
	//private $_user = 'tmsuser';
	//private $_password = 'pRCseCGRE4pV3pGdJ4cBcUSF';
	//private $_database = 'lme76';
	private $_connection = false;
	private $_messages = array();
	
	
	private function __construct(){
		$this->openConnection();
		//$this->startErrorHandling();
	}
	
	/**
	 * @return Migration migration
	 */
	public static function getInstance() {
        if (!isset(self::$_instance)) {
            $c = __CLASS__;
            self::$_instance = new $c;
        }

        return self::$_instance;
	}
	
	public function __destruct(){
		$this->closeConnection();
		$this->endErrorHandleing();
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
	
	public function openConnection(){
		//connection to the database
		$this->_connection = mssql_connect($this->_server, $this->_user, $this->_password)
		  or die("Couldn't connect to SQL Server on {$this->_server}"); 
		
		//select a database to work with
		mssql_select_db($this->_database, $this->_connection)
		  or die("Couldn't open database {$this->_database}"); 
	}
	
	public function closeConnection(){
		//close the connection
		mssql_close($this->_connection);
	}
	
	public function getConnection(){
		return $this->_connection;
	}
	
	public function migrate($action, $page = 1, $perPage = 1000){
		$file = ucfirst($action);
		$class = "Migration_$file";
		
		//Check if the file exists
		if(is_file("$file.php")){
			require_once "$file.php";
			
			//Check if the class exists
			if(class_exists($class)){
				$migrateClass = new $class();
				
				//Check if the method exists
				if(method_exists($migrateClass, "migrate")){
					return $migrateClass->migrate($page, $perPage);
				}
			}
		}
	}
	
	public function addMessage($message){
		$this->_messages[] = $message;
	}
	
	public function showMessages(){
		echo "<ul>";
		foreach ($this->_messages as $message){
			echo "<li>$message</li>";
		}
		echo "</ul>";
	}
}