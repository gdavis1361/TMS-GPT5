<?php
/*
	For: <RDS>
	Type: Database Class
 	
 	$m_sUseDatabase = 'CarrierRates';
 
	Loads row with primary_key = 15
		$o = $this->load( 15[, table] );
		$o->get( table.column );
   
   
	Create a New Record
		$o = $this->insert( 
			array( 
				column  => value, 
				column2 => value2 
			)
			, 'table'
		);
		
		$o->insert_id; // 2
		
		
	Update Existing Record
		$o = $this->load( 15[, table] );
		$o->set( column, value );
		$o->update(); // or save()
   
	
	MULTIPLE RECORDS ( list, update, delete )
   
	Simple List of records
		$this->where( table.column = 15 );
		$o = $this->list();
		
		foreach ( $o->rows as $row ) {
			echo $row->id .': '.$row->first_name.' <br/>';
		}
			
			
	Complex List of records
		$this->join( 'INNER JOIN', 'table', 'column', 'table2', 'column2' );
		$this->where( 'column', '=', array(15,26,34) );
		$this->order( 'column', [DIR = 'DESC'|'ASC'] );
		$this->limit( 15[, OFFSET=0) );
		$o = $this->list();
		
		$o->returned_rows; // 15
		$o->selected_rows; // 100
		$o->rows;          // Array of objects (datalets)
		
		foreach ( $o->rows as $oDatalet ) {
			
			$name = $oDatalet->get('first_name');
			
			switch ( $oDatalet->get('gender') ) {
				case 'M':
					$new_title = 'Mister ';
				break;
				case 'F':
					$new_title = 'Miss ';
			}
			
			$new_name = $new_title . $name;
			
			$oDatalet->set( 'first_name', $new_name );
			$oDatalet->save();
		
		}
		
		
	Update a List of records
		$this->where( 'column', '=', array(15,26,34) );
		$o = $this->update( 
			array( 
				"column" => "newvalue",
				"column2" => "newvalue2" 
			)
		);
		$o->affected_rows; // 15
		
		
	Delete a List of records
		$this->where( 'id', '=', array(15,26,34) );
		$o = $this->delete();
		$o->affected_rows; // 1
*/

class DBModel {

	protected $m_sDBType, $m_sServer, $m_sUsername;
	public $m_sDatabase, $m_sSchema;
	
	public $m_sClassName = __CLASS__;
	public $m_sTableName = '';

	//private $m_sTableName = '';
	private $m_vConnected = FALSE;
	
	// Set from dependent classes
	private $m_nSelectCount = 0; // Selected Row Count
	private $m_nReturnCount = 0; //
	 
	// Active Record
	private $m_aTableData      = array(); // Contains all relevant table information including column types and primary keys
	private $m_vIsLoaded       = FALSE;   // Active Record Loaded Flag - All variables below are unnecessary until this is TRUE
	public $m_aActiveKeys     = array(); // What primary keys are to be loaded if save is called
	public $m_aLoadedValues   = array(); // Contains the loaded values for the current loaded record
	public $m_aModifiedValues = array(); // Contains the modified values for the current loaded record
	
	// Preloaded Record Variables

	// For list(), update(), and delete() methods
	private $m_aListSelect   = array();
	private $m_aListJoin   = array();
	private $m_aListWhere  = array();
	private $m_aListOrder  = array();
	private $m_aListLimit  = array();
	
	public $fireEvents = false;
	private $_errors = array();
	
	public function __construct($key = false) {
		if ($key) {
			$this->load($key);
		}
	}
	
	/**
	 * Connect to SQL Server
	 * @param string $sConnection driver://username:password@server/schema.database  
	 * mssql://username:password@serverhostname/dbo.joomla
	 */
	public function connect( $sConnection = FALSE, $vDefault = FALSE ) {

		// Check for existing connection
		if( !$sConnection && $this->db = get_dbo() ) {
			$this->m_vConnected = TRUE;
			
			$this->get_db_info();
			
			return TRUE;
		}

		// Parse connection string and include appropriate database abstraction
		if ( $aConnectInfo = parse_url($sConnection) ) {
			
			$sDriverPath = DATABASE_DIR . '/drivers/'.$aConnectInfo['scheme'].'.php';
			if ( !file_exists( $sDriverPath ) ) 
				return FALSE;

			require_once( $sDriverPath );
			
			$sDriverClass = $aConnectInfo['scheme'].'_db_driver';
			$this->db = new $sDriverClass;

			if ( !$this->db->connect( $aConnectInfo ) ) {
				return FALSE;
			}
			
			$this->get_db_info();
				
			$this->db->set_dbo();
			
			return TRUE;
		}
		
		return FALSE;
	}
	
	/**
	 * Query Alias for the database
	 * @param string $sSql Sql Statement to execute
	 * @param array  $aBinds  (optional) Values to insert into Sql statement. Escaped and replaces % in order of occurance
	*/
	public function query( $sSql, $aBinds = array() ) {
		return $this->db->query( $sSql, $aBinds );
	}
	
	public function set_primary_db() {
		$this->db->set_primary_db();
	} 
	
	public function get_db_info() {
		// Save Database info in this instance
		$oDatabaseInfo = $this->db->database_info();
		$this->m_sServer   = $oDatabaseInfo->server;
		$this->m_sUsername = $oDatabaseInfo->username;
		$this->m_sDatabase = $oDatabaseInfo->database;
		$this->m_sSchema   = $oDatabaseInfo->schema;
	} 
	
	/**
	 * 
	 * @param 
	 * returns array()
	*/
	
	public function get($sColumnName = FALSE, $sTable = FALSE ) {
		
		if ( !$sTable ) $sTable = $this->m_sTableName;
		
		if ( !$sColumnName ) {
			$aLoad = ( isset($this->m_aLoadedValues[$sTable]) ) ? $this->m_aLoadedValues[$sTable] : array() ;
			$aMod  = ( isset($this->m_aModifiedValues[$sTable]) ) ? $this->m_aModifiedValues[$sTable] : array() ;
			return array_merge( $aLoad, $aMod );
		}
		
		if ( isset($this->m_aModifiedValues[$sTable][$sColumnName]) ) {
			return $this->m_aModifiedValues[$sTable][$sColumnName];
		}
		elseif( isset($this->m_aLoadedValues[$sTable][$sColumnName]) ) {
			return $this->m_aLoadedValues[$sTable][$sColumnName];
		}
	}
		
	/**
	 * 
	 * @param 
	 * 
	*/
	protected function get_modified_columns( $sTable = FALSE ) {
		
		if ( !$sTable ) $sTable = $this->m_sTableName;
		
		if ( count($this->m_aModifiedValues[$sTable]) > 0 ) {
			return $this->m_aModifiedValues[$sTable];
		}
		
		return FALSE;
		
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function set( $sColumnName, $sValue, $sTable = FALSE, $vFlagModified = TRUE, $vDoNotLoad = FALSE ) {
		if ( !$this->is_connected() ) return FALSE;
		
		if ( !$sTable ) $sTable = $this->m_sTableName;
		
		// Load our preloaded info if provided
		if ( !$this->is_loaded() && !$vDoNotLoad ) {
			$aActiveKeys = $this->get_active_keys();
			if ( $aActiveKeys ) {
				$this->load( $aActiveKeys, $sTable );
			}
		}
		
		// Are we loading or modifying the record?
		if ( $vFlagModified ) {
			$this->m_aModifiedValues[$sTable][$sColumnName] = $this->db->typecast_column_value( $sTable, $sColumnName, $sValue );
			//echo $sColumnName.'<br/>';print_r($this->m_aModifiedValues[$sTable]);echo '<br />';
		}
		else {
			$this->m_aLoadedValues[$sTable][$sColumnName] = $this->db->typecast_column_value( $sTable, $sColumnName, $sValue);
		}
		
	}
	
	public function setArray($fieldValues){
		foreach ($fieldValues as $field => $value){
			$this->set($field, $value);
		}
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function load( $aKeys, $sTable = FALSE, $vReturnDatalet = FALSE ) {

		if ( !$this->is_connected() ) return FALSE;
		
		if ( !$sTable ) $sTable = $this->m_sTableName;

		if ( is_object($aKeys) ) { // dblet hack for steve. Loads dblet data into current array.
			$this->preload_data( $aKeys->get() );
			return TRUE;
		}else if ( !is_array($aKeys) ) {
			$aKeys = array( $aKeys );
		}
		
		if ( count($aKeys) == 0) {
			return FALSE;
		}
		
		$this->select_keys( $aKeys );
		$this->limit( 1 );
		$o = $this->list( $sTable );
		if ( count($o->rows) > 0 ) {
			$o = $o->rows;
			$o = $o[0];
			$o = $o->get();
			
			foreach ( $o as $sColumn=>$sValue ) {
				$this->set( $sColumn, $sValue, $sTable, FALSE, TRUE );
			}
			
			$this->m_aActiveKeys = $aKeys;
			
			$this->is_loaded( TRUE );
			return TRUE;
		}
		return FALSE;
	}

	/**
	 * 
	 * @param 
	 * 
	*/
	public function fetch() {	
		
		$this->limit(1);
		$o = $this->list();
		if ( count($o->rows) > 0 ) {
			return $o->rows[0];
		}
		return FALSE;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function select_keys( $aKeys = FALSE, $sTable = FALSE ) {	
		
		if ( !$this->is_connected() ) return FALSE;
		
		if ( !$sTable ) $sTable = $this->m_sTableName;
		
		if ( !$aKeys ) {
			$aKeys = $this->get_active_keys();
		}
		
		if ( !is_array($aKeys) ) {
			$aKeys = array( $aKeys );
		}
		
		$aWildcardValues = array();
		
		foreach ( $aKeys as $sColumnName => $sColumnValue ) {
			if ( !is_numeric($sColumnName) ) {
				$this->where( $sColumnName, '=', $sColumnValue );
			}
			else {
				$aWildcardValues[] = $sColumnValue;
			}
		}
		
		if ( count($aWildcardValues) > 0 ) {
			$aPrimaryKeys = $this->db->fetch_primary_keys( $sTable );
			if ( count($aPrimaryKeys) > 0 ) {
				$this->where( $aPrimaryKeys, '=', $aWildcardValues );
			}
			else {
				addNote('DBModel: Could not select_keys(). Could not identify the column => value relationship. Please specify a column in your associative array.');
				return FALSE;
			}
			
		}
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function insert( $aData, $sTable = FALSE ) {
		if ( !$this->is_connected() ) return FALSE;

		if ( !$sTable ) $sTable = $this->m_sTableName;
		
		if ( $nIdentity = $this->db->insert( $sTable, $aData ) ) {
			
			$this->load( $nIdentity, $sTable );
			
			if ($this->fireEvents) {
				$eventName = $this->m_sClassName . '.' . end(explode('::', __METHOD__));
				LP_EventManager::fireEvent($eventName, $this);
			}
			
			return TRUE;
		}
		
		return FALSE;
	}
	
	/**
	 *  
	 * @param 
	 * 
	*/
	public function join( $sJoinType = 'INNER', $sJoinTable1, $sJoinColumn1, $sJoinTable2, $sJoinColumn2 ){
		$this->m_aListJoin[] = array(
			 'join_type'     => $sJoinType
			,'join_table_1'  => $sJoinTable1
			,'join_column_1' => $sJoinColumn1
			,'join_table_2'  => $sJoinTable2
			,'join_column_2' => $sJoinColumn2
		);
		return;
	}
	
	/**
	 *  
	 * @param 
	 * 
	*/
	public function select( $aColumn ) {
		if ( !is_array($aColumn) ) {
			$aColumn = array($aColumn);
		}
		foreach ( $aColumn as $sColumnAlias=>$sColumn ) {
			if ( !is_numeric($sColumnAlias) ) 
			$this->m_aListSelect[] = array(
				 'select_column' => $sColumn
				,'select_alias'  => ( ( !is_numeric($sColumnAlias) ) ? $sColumnAlias : FALSE )
			);
		}
		return;
	}
	
	
	/**
	 *  
	 * @param 
	 * 
	*/
	public function where( $aColumn, $sOperator, $aValue, $sValue2 = FALSE ) {
		if ( !is_array($aColumn) ) {
			$aColumn = array($aColumn);
		}

		foreach ( $aColumn as $sColumn ) {
			$this->m_aListWhere[] = array(
				'where_column'   => $sColumn,
				'where_operator' => $sOperator,
				'where_value1'   => $aValue,
				'where_value2'   => $sValue2,
			);
		}
		return;
	}
	
	/**
	 *  
	 * @param 
	 * 
	*/
	public function order( $sColumn, $sDirection = 'DESC' ){
		$this->m_aListOrder[] = array(
			 'order_column'    => $sColumn
			,'order_direction' => $sDirection
		);
		return;
	}
	
	/**
	 *  
	 * @param 
	 * 
	*/
	public function limit( $nLimit, $nOffset = 0 ){
		$this->m_aListLimit = array(
			 'limit_return'    => $nLimit
			,'limit_offset' => $nOffset
		);
		return;
	}
	
	/**
	 * Also list() -- Lists all records found in database and Filters when where(), join(), limit(), 
	 * and order() functions are used prior.
	 * @param string $sTable Name of affected table
	 * 
	*/
	private function list_by_filters( $sTable = FALSE ){
		
		if ( !$this->is_connected() ) return FALSE;
		
		if ( !$sTable ) $sTable = $this->m_sTableName;
		
		$oRes = $this->db->action_rows( $sTable, 'select', FALSE, $this->m_aListSelect, $this->m_aListJoin, $this->m_aListWhere, $this->m_aListOrder, $this->m_aListLimit );
		
		$aReturn = array();
		
		if ( $this->db->num_rows($oRes) > 0 ) {
			
			$aKeys = $this->db->fetch_primary_keys($sTable);
			
			while( $oList = $this->db->fetch_object($oRes) ) {
				
				if ( $aKeys ) {
					$a = array();
					foreach ( $aKeys as $sKeyNameLower => $sKeyName ) {
						if ( isset($oList->{$sKeyName}) ) {
							$a[$sKeyName] = $oList->{$sKeyName};
						}
					}
				}
				
				$o = new datalet( $aKeys, $sTable );
				foreach ( $oList as $sColumn=>$sValue ) {
					$o->set( $sColumn, $sValue, $sTable, FALSE, TRUE );
				}
				$aReturn[] = $o;
			}	
		}
		
		$oListInformation = (object)'';
		
		$oListInformation->result        = $oRes;
		$oListInformation->rows          = $aReturn;
		$oListInformation->keys          = array();
		$oListInformation->returned_rows = $this->db->num_rows($oRes);
		$oListInformation->selected_rows = $this->db->selected_num_rows($oRes);
	
		// Clear our filters
		$this->clear_filters();
		
		return $oListInformation;
	}
	
	/**
	 * Updates the current loaded record with set info OR if an array of data is provided, updates joined records with provided data. Similar to save().
	 * @param array  $aData (optional) Updates selected rows as specified in the where(), join(), order(), limit() functions.
	 * @param string $sTable (optional) Selected table for
	*/
	public function update( $aData = FALSE, $sTable = FALSE ) {

		if ( !$this->is_connected() ) { echo "NOT CONNECTED"; return FALSE; }

		// This function must be completely intentional and have at least one where clause
		if ( count($this->m_aListWhere) == 0 ) { echo "NO WHERE CLAUSE"; return FALSE; }

		if ( !$sTable ) $sTable = $this->m_sTableName;

		$oResult = $this->db->action_rows( $sTable, 'update', $aData, $this->m_aListSelect, $this->m_aListJoin, $this->m_aListWhere, $this->m_aListOrder, $this->m_aListLimit );
		
		$this->clear_filters();
		
		$oUpdateInformation = (object) '';
		$oUpdateInformation->affected_rows = $this->db->affected_rows( $oResult );
		
		if ($this->fireEvents) {
			$eventName = $this->m_sClassName . '.' . end(explode('::', __METHOD__));
			LP_EventManager::fireEvent($eventName, $this);
		}

		return $oUpdateInformation;
	}

	/**
	 * Counts the rows matched
	 * @param array  $aData (optional) Updates selected rows as specified in the where(), join(), order(), limit() functions.
	 * @param string $sTable (optional) Selected table for
	*/
	public function count( $aData = FALSE, $sTable = FALSE ) {

		if ( !$this->is_connected() ) return FALSE;

		// This function must be completely intentional and have at least one where clause
		if ( count($this->m_aListWhere) == 0 ) return FALSE;

		if ( !$sTable ) $sTable = $this->m_sTableName;

		$oResult = $this->db->action_rows( $sTable, 'update', $aData, $this->m_aListSelect, $this->m_aListJoin, $this->m_aListWhere, $this->m_aListOrder, $this->m_aListLimit );

		$this->clear_filters();

		$oUpdateInformation = (object) '';
		$oUpdateInformation->affected_rows = $this->db->affected_rows( $oResult );

		return $oUpdateInformation;
	}
	
	/** 
	 * Saves set data for a particular row 
	*/
	public function save() {
		
		if ( !$this->is_connected() ) return FALSE;
		
		$sTable = $this->m_sTableName;
		
		// What new column data do we have?
		$aData = $this->get_modified_columns( $sTable );
		
		// Update or Insert?
		if ( $this->is_loaded() ) {
			$this->select_keys();
			
			$returnData = $this->update( $aData, $sTable );
			if ($this->fireEvents) {
				$eventName = $this->m_sClassName . '.' . end(explode('::', __METHOD__));
				LP_EventManager::fireEvent($eventName, $this);
			}
			return $returnData;
		}
		else {
			$returnData = $this->insert( $aData, $sTable );
			if ($this->fireEvents) {
				$eventName = $this->m_sClassName . '.' . end(explode('::', __METHOD__));
				LP_EventManager::fireEvent($eventName, $this);
			}
			return $returnData;
		}
		
	}
	
	/** 
	 * Saves and sorts an order row to allow for the change
	 * IF ORDER IS PROVIDED
	 *    SHIFT OTHER ORDERS UP
	 *    INSERT WITH PROVIDED ORDER
	 * IF ORDER IS NOT PROVIDED
	 *    GET MAX ORDER
	 *    INSERT GOT ORDER
	 * END
	*/
	public function savesort() {
				
		// Not Implemented
		
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function delete( $aKeys = FALSE, $sTable = FALSE ) {

		if ( !$this->is_connected() ) return FALSE;
		
		if ( $aKeys && !is_array($aKeys) ) $aKeys = array($aKeys);
		
		if ( $aKeys && count($aKeys) > 0 ) {
			$this->select_keys($aKeys);
		} elseif ( $this->is_loaded() && $aKeys = $this->get_active_keys() ) {
			$this->select_keys($aKeys);
		}
		
		// This function must be completely intentional and have at least one where clause
		if ( count($this->m_aListWhere) == 0 ) return FALSE;
				
		if ( !$sTable ) $sTable = $this->m_sTableName;
		
		$oList = $this->db->action_rows( $sTable, 'delete', array(), $this->m_aListSelect, $this->m_aListJoin, $this->m_aListWhere, $this->m_aListOrder, $this->m_aListLimit );
		
		// Clear our filters
		$this->clear_filters();
		
		if ($this->fireEvents) {
			$eventName = $this->m_sClassName . '.' . end(explode('::', __METHOD__));
			LP_EventManager::fireEvent($eventName, $this);
		}
		
		#return $oDeleteInformation;
	}

	/**
	 *  
	 * @param 
	 * 
	*/
	public function clear_filters(){
		$this->m_aListSelect = array();
		$this->m_aListJoin   = array();
		$this->m_aListWhere  = array();
		$this->m_aListOrder  = array();
		$this->m_aListLimit  = array();
	}

	/**
	 *  
	 * @param 
	 * 
	*/
	public function unload() {
		$this->is_loaded( FALSE );
		$this->m_aLoadedValues = array();
		$this->m_aActiveKeys = array();
		$this->m_aTableValues = array();
		$this->m_nRowCount = 0;
		$this->m_nReturnCount = 0;
	}
	/**
	 *  
	 * @param 
	 * 
	*/
	public function clear() {
		$this->unload();
	}
	
	/**
	 *  Returns an array of currently loaded keys
	 * @param void
	 * 
	*/
	public function get_active_keys() {
		if ( isset($this->m_aActiveKeys) && count($this->m_aActiveKeys) ) {
			return $this->m_aActiveKeys;
		}
		return false;
	}
	
	/**
	 *  
	 * @param 
	 * 
	*/
	public function is_loaded( $v = NULL ) {
		if ( $v !== NULL && is_bool($v) ) $this->m_vIsLoaded = $v;
		return $this->m_vIsLoaded;
	}
	
	/**
	 * Returns TRUE if connected to a database server
	 * @param void
	 * 
	*/
	public function is_connected() {
		if ( $this->connect() ) {
			return $this->m_vConnected;
		}
		
		return FALSE;
	}
		
	
	/**
	 * Returns the last message from the database server 
	 * @param void
	*/
	public function get_message( ) {
		return $this->db->get_message();
	}
	
	/**
	 * Magic calls for set_*(), get_*() and list() functions.
	 * Refer to PHPDOCS for __call syntax
	*/
	public function __call ( $name, $args = array() ) {
		switch ( 1 ) {
			case preg_match("/set_*/i",$name):

				$sColumnName = strtolower( $name );
				$sColumnName = (strpos($sColumnName,"set_") === 0) ? substr( $sColumnName, strlen("set_") ) : $sColumnName ;
				
				if( count($args) > 0 ) {
					return $this->set( $sColumnName, $args[0] );
				}

			break;
			case preg_match("/get_*/i",$name):

				$sColumnName = strtolower( $name );
				$sColumnName = (strpos($sColumnName,"get_") === 0) ? substr( $sColumnName, strlen("get_") ) : $sColumnName ;

				return $this->get( $sColumnName );

			break;
			case (strtolower($name) == 'list'):
				$sTable = ( isset($args[0]) ) ? $args[0] : FALSE;
				return $this->list_by_filters( $sTable );
			break;
			
			case (strtolower($name) == 'db'):
				if ( $this->is_connected() ) {
					return $this->db;
				}
			break;
		}
	}
	
	public function __get($name) {
		return $this->get( strtolower( $name ) );
	}

	/**
	 *
	 * @param
	 *
	*/
	public function preload_data( $aData ) {

		if ( !is_array($aData) )
			return FALSE;

		if ( count($aData) == 0 )
			return FALSE;

		foreach ( $aData as $sColumn => $sValue ) {
			$this->set( $sColumn, $sValue, $this->m_sTableName, FALSE, TRUE );
		}

	}
	
	public function getRow() {
		return $this->m_aLoadedValues[$this->m_sTableName];
	}
	
	public function getModifiedRow() {
		return $this->m_aModifiedValues[$this->m_sTableName];
	}
	
	public function addError($message, $field = null){
		if($field == null){
			$this->_errors[] = $message;
		}
		else{
			$this->_errors[$field] = $message;
		}
	}
	
	public function clearErrors(){
		$this->_errors = array();
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
 * Datalets contain preloaded information of a row and functionality to modify the loaded record 
 * @param 
 * 
*/
class datalet extends DBModel {	
	
	/**
	 *  
	 * @param 
	 * 
	*/
	public function __construct( $aKeys, $sTable ) {
		$this->m_aActiveKeys = $aKeys;
		$this->m_sTableName = $sTable;
		$this->m_vDatalet = TRUE;
	}
	
	/**
	 *  
	 * @param 
	 * 
	*/
	public function load( $aKeys = FALSE , $sTable = FALSE, $vReturnDatalet = FALSE ) {
		if ( $aKeys )
		parent::load( $this->m_aActiveKeys, $this->m_sTableName, $vReturnDatalet );
	}

	/**
	 *  
	 * @param 
	 * 
	*/
	public function unload(){
		$this->__destruct();
	}
}