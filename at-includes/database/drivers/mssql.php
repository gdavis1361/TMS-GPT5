<?php
class mssql_db_driver {
	
	protected $m_sDBType, $m_sServer, $m_sUsername, $m_sDatabase;
	
	private $db;
	private $aDatabaseInfo = array();
	private $m_sTableName = '';
	private $m_vConnected = FALSE;
	
	
	/**
	 * Querys MSSQL database
	 * @param $oRes Result resource to evaluate
	 * 
	*/
	public function connect( $aConnectInfo = FALSE ) {
		if ( !$aConnectInfo ) return;
		
		$aConnectInfo['path'] = substr( $aConnectInfo['path'], 1 );
		
		if ( !$aConnectInfo['host'] ) $aConnectInfo['host'] = NULL;
		if ( !$aConnectInfo['user'] ) $aConnectInfo['user'] = NULL;
		if ( !$aConnectInfo['pass'] ) $aConnectInfo['pass'] = NULL;
		if ( !$aConnectInfo['path'] ) $aConnectInfo['path'] = NULL;
		
		$this->dbc = mssql_connect( $aConnectInfo['host'], $aConnectInfo['user'], $aConnectInfo['pass'] );
		if( $this->dbc ) {
			if ( strpos($aConnectInfo['path'], '.') ) {
				$aConnectInfo['schema'] = substr($aConnectInfo['path'], 0, strpos($aConnectInfo['path'], '.') );
				$aConnectInfo['path']   = substr($aConnectInfo['path'], strpos($aConnectInfo['path'], '.') + 1 );
			}
			if ( $this->select_db( $aConnectInfo['path'], $this->dbc ) ) {
				addNote('DBModel: Successfully Connected!');
			}
			else {
				return FALSE;
			}
			
		} else {
			error_log(mssql_get_last_message());
			return FALSE;
		}
		
		$this->m_sDBType   = $aConnectInfo['host'];
		$this->m_sServer   = $aConnectInfo['host'];
		$this->m_sUsername = $aConnectInfo['user'];
		$this->m_sDatabase = $aConnectInfo['path'];
		$this->m_sSchema   = $aConnectInfo['schema'];
		
		return TRUE;
	}
	
	public function database_info() {
		$oDBInfo = (object)'';
		$oDBInfo->database = $this->m_sDatabase;
		$oDBInfo->server   = $this->m_sServer;
		$oDBInfo->username = $this->m_sUsername;
		$oDBInfo->schema   = $this->m_sSchema;
		return $oDBInfo;
	}
	
	function select_db( $sDatabase, $oDbc = FALSE ) {
		if ( !$oDbc && $this->dbc ) {
			$oDbc = $this->dbc;
		}
		
		return mssql_select_db( $sDatabase, $oDbc );
	}
	
	/**
	 * Querys MSSQL database
	 * @param string $sSql Result resource to evaluate
	 * 
	*/
	public function query( $sSql, $aBinds = array() ){
		if ( !$this->dbc ) return;
		
		//$aBinds to be implemented (escape the binds prior)
		if ( !is_array($aBinds) && strlen($aBinds) > 0 ) 
			$aBinds = array($aBinds);
			
		if ( count($aBinds) > 0 ) {
			array_walk($aBinds, array( $this, 'sql_escape') );
			$sSql = $this->replace_unquoted_character( $sSql, '?', $aBinds );
		}
		
		addNote('DBModel '.$this->m_sDatabase.' Query: '.$sSql);
		
		if ( $oRes = mssql_query( $sSql, $this->dbc ) ) {
			addNote('DBModel Query: Success');
			return $oRes;
		}
		trigger_error('Query Failed:'.$sSql); 
		addNote('DBModel Query: Failed');
		return FALSE;
	}
	
	public function set_primary_db() {
		$this->set_dbo( TRUE );
	} 
	public function set_dbo( $vIsPrimary = FALSE ) {
		set_dbo( $this, $this->m_sDatabase, $vIsPrimary );
	} 
	
	public function set_db( $sDBName ) {
		$this->m_sDatabase = $sDBName; // We like this
	}
	
	
	private function replace_unquoted_character( $sString, $sFind, $aReplace ) {
		$vInQuote = FALSE;
		$aFoundLocations = array();
		
		for ( $n = 0; $n < strlen($sString); $n++ ) {
			if ( $vInQuote == substr($sString, $n, 1) ) {
				$vInQuote = FALSE;
			}
			else {
				switch ( substr($sString, $n, 1 ) ) {
					case '"':
						$vInQuote = '"';
						break;
					case "'":
						$vInQuote = "'";
						break;
					case $sFind:
						$aFoundLocations[] = $n;
				}
			}
		}
		
		if ( count( $aFoundLocations ) == count( $aReplace ) ) {
			$aFoundLocations = array_reverse( $aFoundLocations );
		}
		else {
			trigger_error( 'User Function: replace_unquoted_character replacement mismatch: Found '.count( $aFoundLocations ).' occurrences of needle and only '.count( $aReplace ).' replacement(s).' );
		}
		
		foreach ( $aFoundLocations as $nKey=>$nLocation ) {
			$sString = substr( $sString, 0, $nLocation ) . $aReplace[$nKey] . substr( $sString, $nLocation + 1 );
		}
		
		return $sString;
	}
	/**
	 * Returns the number of rows in the result set
	 * @param object $oRes Result resource to evaluate
	 * 
	*/
	public function num_rows( $oRes ) {
		return mssql_num_rows( $oRes );
	}
	
	/**
	 * Returns the number of rows selected from the previous result set
	 * @param object $oRes Result resource to evaluate
	 * 
	*/
	public function selected_num_rows( $oRes ) {
		// Need a solid comparison
		return mssql_num_rows( $oRes );
	}

	/**
	 * Returns the number of rows in the result set
	 * @param object $oRes Result resource to evaluate
	 * 
	*/
	public function affected_rows() {
		return mssql_rows_affected( $this->dbc );
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function fetch_object( $oRes ) {
		return mssql_fetch_object( $oRes );
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function fetch_array( $oRes ) {
		return mssql_fetch_array( $oRes );
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function fetch_assoc( $oRes ) {
		return mssql_fetch_assoc( $oRes );
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function escape( $sData ) {
		if ( is_numeric($sData) || $sData === 0 ) return $sData;
		if ( !isset($sData) or empty($sData) ) return '';

		$non_displayables = array(
			'/%0[0-8bcef]/',            // url encoded 00-08, 11, 12, 14, 15
			'/%1[0-9a-f]/',             // url encoded 16-31
			'/[\x00-\x08]/',            // 00-08
			'/\x0b/',                   // 11
			'/\x0c/',                   // 12
			'/[\x0e-\x1f]/'             // 14-31
		);
		
		
		foreach ( $non_displayables as $regex )
			$sData = preg_replace( $regex, '', $sData );
		
		
		//pre($sData);
		$sData = str_replace("'", "''", $sData );
		return $sData;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function sql_escape( $sData ) {
		return $this->mssql_escape($sData);
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	private function mssql_escape($sData) {
		//if ( is_numeric($sData) )
			//return $sData;
		
		$sData = "'".$this->escape($sData)."'";
		return $sData;
		
		/*
		$unpacked = unpack('H*hex', $sData);
		return '0x' . $unpacked['hex'];
		*/
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function fetch_columns( $sTable ) {
		
		addNote('DBModel: Cache '.$sTable.' Columns');
		
		$oRes = $this->query("SELECT DISTINCT col.COLUMN_NAME, col.COLUMN_DEFAULT, col.IS_NULLABLE, col.DATA_TYPE, col.CHARACTER_MAXIMUM_LENGTH, col.NUMERIC_PRECISION,  col.NUMERIC_SCALE, col.DATETIME_PRECISION, ISNULL(keys.ORDINAL_POSITION, 0) as PRIMARY_KEY, ISNULL(keys.CONSTRAINT_NAME, 0) as CONSTRAINT_NAME FROM ".$this->m_sDatabase.".INFORMATION_SCHEMA.Columns col LEFT JOIN ".$this->m_sDatabase.".INFORMATION_SCHEMA.KEY_COLUMN_USAGE keys ON ( col.TABLE_CATALOG = keys.TABLE_CATALOG AND col.TABLE_NAME = keys.TABLE_NAME AND col.COLUMN_NAME = keys.COLUMN_NAME  ) WHERE col.TABLE_NAME = '".$this->escape($sTable)."'");
		
		if ( $this->num_rows($oRes) <= 0 )
			return FALSE;
		
		$aColumns = array();
		while ( $oRow = $this->fetch_object( $oRes ) ) {
			$aColumns[$oRow->COLUMN_NAME] = array(
				 'column_name'        => $oRow->COLUMN_NAME
				,'primary_key'        => ( $oRow->PRIMARY_KEY == 1 && substr($oRow->CONSTRAINT_NAME,0,2) == 'PK'  ) ? TRUE : FALSE 
				,'type'               => $oRow->DATA_TYPE
				,'default'            => $oRow->COLUMN_DEFAULT
				,'null'               => ( $oRow->IS_NULLABLE == 'YES' ) ? 1 : 0 
				,'length'             => $oRow->NUMERIC_PRECISION
				,'decimal_float'      => $oRow->NUMERIC_SCALE
				,'datetime_precision' => $oRow->DATETIME_PRECISION
			);
		}
		return $aColumns;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function cache_columns( $sTable ) {
		
		// Already Cached
		if ( isset($this->aDatabaseInfo[ $sTable ]) ) 
			return TRUE;
		
		// Fetch Columns
		if ( !$aColumnInfo = $this->fetch_columns( $sTable ) ) 
			return FALSE;
		
		if ( count($aColumnInfo) > 0 ) { 
			
			foreach ( $aColumnInfo as $aColumn ) {
				$this->aDatabaseInfo[ $sTable ]['columns'][ $aColumn['column_name'] ] = $aColumn;
				
				if ( $aColumn['primary_key'] == TRUE ) {
					$this->aDatabaseInfo[ $sTable ]['primary_keys'][strtolower($aColumn['column_name'])] = $aColumn['column_name'];
				}
			}
			// Update our DBO to save info for other db instances
			$this->set_dbo();
		}
		
		return TRUE;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function table_columns( $sTable ) {
		
		// Fetch Columns if we haven't already

		if ( !$this->cache_columns( $sTable ) ) 
			return FALSE;
		
		if ( isset($this->aDatabaseInfo[ $sTable ]['columns']) ) {
			$aReturn = array();
			foreach ( $this->aDatabaseInfo[ $sTable ]['columns'] as $aColumnData ) {
				$aReturn[] = $aColumnData['column_name'];
			}
			return $aReturn;
		}
		
		return FALSE;
		
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function column_info( $sTable, $sColumn ) {
		
		// Fetch Columns if we haven't already
		if ( !$this->cache_columns( $sTable ) ) 
			return FALSE;
		
		if ( isset($this->aDatabaseInfo[ $sTable ]['columns'][ $sColumn ]) ) {
			return $this->aDatabaseInfo[ $sTable ]['columns'][ $sColumn ];
		}
		
		return FALSE;
		
	}
	
	/**
	 * Returns an array of the primary keys for the specified table
	 * @param string $sTable 
	 * 
	*/
	public function fetch_primary_keys( $sTable ) {
		
		if ( !$this->cache_columns( $sTable ) )
			return FALSE;
		
		if( isset($this->aDatabaseInfo[ $sTable ]['primary_keys']) ) {
			return $this->aDatabaseInfo[ $sTable ]['primary_keys'];
		}
		
		return FALSE;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function fetch_indexes( $sTable ) {
		// Not Implemented
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function load( $aKeys, $sTable ) {
		
		// Cache the generated query
//		$cache = LP_Memcache::getInstance()->cache;
//		$cacheId = $sTable . json_encode($aKeys);
//		$query = '';
//		if (!$cache->test($cacheId)) {
//			// Cache miss
//			
//		
//			$this->cache_columns( $sTable );
//			$sWhereSql = '1'; 
//
//			// If only a value was provided, make sure we check all primary keys on table
//			if ( isset( $aKeys['/'] ) ) {
//				if ( count($this->aDatabaseInfo[ $sTable ]['primary_keys']) > 0 ) {
//					$aSql = array();
//					foreach ( $this->aDatabaseInfo[ $sTable ]['primary_keys'] as $sKeyColumn ) {
//						$aSql[]= array($sKeyColumn, $aKeys['/'] );
//					}
//				}
//			}
//			// Likewise, let's ensure that they primary key provided is a legitimate primary key
//			elseif ( count($aKeys) > 0 ) {
//				foreach ( $aKeys as $sKeyColumn => $sKeyValue ) {
//					if ( isset($this->aDatabaseInfo[ $sTable ]['primary_keys'][strtolower($sKeyColumn)]) ) {
//						$aSql[]= array( $this->aDatabaseInfo[ $sTable ]['primary_keys'][strtolower($sKeyColumn)], $sKeyValue);
//					}
//				}
//				if ( count($aSql) == 0 )
//					return false;
//			}
//			else {
//				return FALSE;
//			}
//
//			$aWhere = array();
//
//			foreach ( $aSql as $aWhereRow ) { 
//				$aWhere[] = array(
//					 'where_operator' => '='
//					,'where_column' => $aWhereRow[0]
//					,'where_value1' => $aWhereRow[1]
//					,'where_value2' => NULL
//				);
//			}
//			$query = '
//				SELECT '.$this->build_sql_select( FALSE, $sTable ).'
//				FROM ['.$this->m_sDatabase.'].['.$this->m_sSchema.'].['.$sTable.']
//				'.$this->build_sql_where( $aWhere, $sTable ).'
//				LIMIT 1
//			';
//			$cache->save($query, $cacheId, array(), 120);
//		}
//		else {
//			// Cache hit
//			$query = $cache->load($cacheId);
//		}
//		
//		$oRes = $this->query($query);
		
		$this->cache_columns( $sTable );
		$sWhereSql = '1'; 
		
		// If only a value was provided, make sure we check all primary keys on table
		if ( isset( $aKeys['/'] ) ) {
			if ( count($this->aDatabaseInfo[ $sTable ]['primary_keys']) > 0 ) {
				$aSql = array();
				foreach ( $this->aDatabaseInfo[ $sTable ]['primary_keys'] as $sKeyColumn ) {
					$aSql[]= array($sKeyColumn, $aKeys['/'] );
				}
			}
		}
		// Likewise, let's ensure that they primary key provided is a legitimate primary key
		elseif ( count($aKeys) > 0 ) {
			foreach ( $aKeys as $sKeyColumn => $sKeyValue ) {
				if ( isset($this->aDatabaseInfo[ $sTable ]['primary_keys'][strtolower($sKeyColumn)]) ) {
					$aSql[]= array( $this->aDatabaseInfo[ $sTable ]['primary_keys'][strtolower($sKeyColumn)], $sKeyValue);
				}
			}
			if ( count($aSql) == 0 )
				return false;
		}
		else {
			return FALSE;
		}
		
		$aWhere = array();
		
		foreach ( $aSql as $aWhereRow ) { 
			$aWhere[] = array(
				 'where_operator' => '='
				,'where_column' => $aWhereRow[0]
				,'where_value1' => $aWhereRow[1]
				,'where_value2' => NULL
			);
		}
		
		$oRes = $this->query('
			SELECT '.$this->build_sql_select( FALSE, $sTable ).'
			FROM ['.$this->m_sDatabase.'].['.$this->m_sSchema.'].['.$sTable.']
			'.$this->build_sql_where( $aWhere, $sTable ).'
			LIMIT 1
		');
		
		// Define our primary_keys for future queries
		$aKeys = array();
		$aRows = $this->fetch_array($oRes);
		foreach ( $this->aDatabaseInfo[ $sTable ]['primary_keys'] as $sKeyColumn ) {
			$aKeys[ $sKeyColumn ] = $aRows[ $sKeyColumn ]; 
		}
		
		$oReturn->rows          = $this->fetch_object($oRes);
		$oReturn->keys          = $aKeys;
		$oReturn->returned_rows = $this->num_rows($oRes);
		$oReturn->selected_rows = $this->num_rows($oRes);
		
		return $oReturn;
	}
	
	/**
	 * 
	 * @param string $sTable Name of query table
	 * @param string $sAction Type of query : SELECT UPDATE DELETE
	 * @param array $aJoin array( TYPE, TABLE1, COLUMN1, TABLE2, COLUMN2 ) 
	 * @param array $aWhere array( COLUMN, OPERATOR, VALUE1, VALUE2 )
	 * @param array $aOrder array( COLUMN, DIRECTION ) 
	 * @param array $aLimit array( RETURN, START ) 
	*/
	public function action_rows( $sTable, $sAction = 'select', $aData = array(), $aSelect = array(), $aJoin = array(), $aWhere = array(), $aOrder = array(), $aLimit = array() ) {
		
		// Compile our Queries
		$sLimitSql      = $this->build_sql_limit( $aLimit );
		$sJoinSql       = $this->build_sql_join(  $aJoin );
		$sWhereSql      = $this->build_sql_where( $aWhere, $sTable );
		$sOrderSql      = $this->build_sql_order( $aOrder );
		
		// Build the first part of our statement
		$sAction = strtoupper($sAction);
		switch ( $sAction ) {
			case 'UPDATE':
				if (count($aData) == 0 ) {
					addNote('DBModel: Update failed, no data to update was provided.');
					return FALSE;
				}
				else {
					$aUpdateSql = array();
					
					foreach ( $aData as $sColumn => $aValue ) {
						
						// [0] Literal Value
						// [1] Raw SQL
						if ( !is_array($aValue) ) {
							$aValue = array($aValue,'');
						}
						
						if ( is_null($aValue[0]) || (isset($aValue[0]) && $aValue[0] !== FALSE && strlen( $aValue[0] ) > 0 ) ) {
							$sValue = $this->typecast_column_value( $sTable ,$sColumn, $aValue[0] );
							if ( $sValue === NULL ) {
								$sValue  = 'NULL';
							}
							else {
								$sValue = $this->sql_escape( $sValue );
							}
						}
						elseif ( isset($aValue[1]) && $aValue[1] !== FALSE && strlen($aValue[1]) > 0 ) {
							$sValue = $aValue[1];
						}
						else {
							continue;
						}
						$aUpdateSql[] = '['. $sTable .'].['. $sColumn .'] = '. $sValue ; 
					}
				}
				
				if ( !empty($aUpdateSql) ) {
					$sSqlLead = $sAction .' '.$sLimitSql.' ['.$this->m_sDatabase.'].['.$this->m_sSchema.'].['.$sTable.'] SET '.implode( ',', $aUpdateSql );
				}
				else {
					return false;
				}
				break;
			case 'DELETE':
				$sSqlLead = $sAction .' '.$sLimitSql.' FROM ['.$this->m_sDatabase.'].['.$this->m_sSchema.'].['.$sTable.'] ';
				break;
			default:
				$sAction = 'SELECT';
				$sSelectColumns = $this->build_sql_select( $aSelect, $sTable );
				$sSqlLead = $sAction .' '. $sLimitSql .' '. $sSelectColumns .' FROM ['. $this->m_sDatabase .'].['. $this->m_sSchema .'].['. $sTable .'] '. $sJoinSql .' ';
		}
		
		
		// Execute what we have
		$oRes = $this->query('
			'.$sSqlLead.'
			'.$sWhereSql.'
			'.$sOrderSql.'
		');
		
		return $oRes;
	}

	/**
	 * 
	 * @param 
	 * 
	*/
	public function insert( $sTable, $aData ) {

		$sInsertSql = $this->build_sql_insert( $sTable, $aData );
		
		// Execute what we have
		$oRes = $this->query('
			INSERT INTO
			['.$this->m_sDatabase.'].['.$this->m_sSchema.'].['.$sTable.']
			'.$sInsertSql.'
		');
		
		if ( $oRes ) {
			$oRes = $this->query("SELECT @@IDENTITY AS ID;");
			$oRow = $this->fetch_object($oRes);
			return $oRow->ID;
		}
		
		return FALSE;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	private function build_sql_select( $aColumns = array(), $aIncludedTables = array() ) {
	
		if ( $aColumns && !is_array($aColumns) && strlen($aColumns) > 0 ) {
			$aColumns = array($aColumns);
		}
		if ( $aIncludedTables && !is_array($aIncludedTables) && strlen($aIncludedTables) > 0 ) {
			$aIncludedTables = array($aIncludedTables);
		}
		
		$sSql = '';
		
		// Select Tables
		$aColumnSelects = array();
		
		// Full table selects
		if ( !$aColumns && $aIncludedTables && count($aIncludedTables) > 0 ) {
			foreach ( $aIncludedTables as $sTable ) {
				if ( $aColumnData = $this->table_columns( $sTable ) ) {
					foreach ( $aColumnData as $aColumn ) {
						$aColumnSelects[] = '['.$this->m_sDatabase.'].['.$this->m_sSchema.'].['.$sTable.'].['.$aColumn.']';
					}	
				}
			}
			$sSql .= implode( ',', $aColumnSelects );
		}
		
		// Provided Column Selects
		if ( $aColumns && count($aColumns) > 0 ) {
			foreach ( $aColumns as $aColumn ) {
				$sColumn = $aColumn['select_column'];
				$sColumnAlias = $aColumn['select_alias'];
				
				if ( !is_numeric($sColumnAlias) ) {
					$sColumn .= ' AS '.$sColumnAlias;
				}
			}
			
			$aColumnSelects[] = $sColumn;
			$sSql .= implode( ',', $aColumnSelects );
		}
		
		return $sSql;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	private function build_sql_insert( $sTable, $aInsertValues = array() ) {
		
		if ( !is_array($aInsertValues) )
			return FALSE;
		
		$aColumnData = array();
		$aValueData  = array();
		
		foreach ( $aInsertValues as $sColumn => $sValue ) {
			$aColumnData[] = $sColumn;
			
			if ( $sValue === NULL ) {
				$aValueData[]  = 'NULL';
			}
			else { 
				$sValue = $this->typecast_column_value( $sTable ,$sColumn, $sValue );
				$sValue = $this->sql_escape( $sValue );
				$aValueData[] = $sValue;
			}
		}
		
		$sSql = ' ('. implode(',', $aColumnData) .') VALUES ('. implode(' , ', $aValueData ) .')';
		
		return $sSql;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	private function build_sql_limit( $aLimit = array() ) {
		$sSql = '';
		
		if ( $aLimit && is_array($aLimit) && count($aLimit) > 0 ) {
			$nLimit  = (isset($aLimit['limit_return'])) ? $aLimit['limit_return'] : FALSE;
			$nOffset = (isset($aLimit['limit_offset'])) ? $aLimit['limit_offset'] : FALSE;;

			if ( is_numeric($nLimit) ) {
				$sSql = ' TOP '.$nLimit;
			}
		}
		return $sSql;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	private function build_sql_join( $aJoin = array() ) {
		addNote($aJoin);
		$sSql = '';
		if ( count($aJoin) > 0 ) {
			$aSql = array();
			foreach ( $aJoin as $aJoinData ) { 
				$aSql[] = $aJoinData['join_type'].
					' ['.$this->m_sDatabase.'].['.$this->m_sSchema.'].['. $aJoinData['join_table_2'] .'] ON (
						['.$this->m_sDatabase.'].['.$this->m_sSchema.'].['. $aJoinData['join_table_1'] .'].['. $aJoinData['join_column_1'] .'] = ['.$this->m_sDatabase.'].['.$this->m_sSchema.'].['. $aJoinData['join_table_2'] .'].['. $aJoinData['join_column_2'] .']
					) ';
			}
			$sSql = implode(' ',$aSql);
		}
		addNote($sSql);
		return $sSql;
	}

	/**
	 * 
	 * @param 
	 * 
	*/
	private function build_sql_where( $aWhere = array(), $sTable = FALSE ) {
		$sSql = '';
		
		if ( $aWhere && is_array($aWhere) && count($aWhere) > 0 ) {
			$aWhereSql = array();
			$aWhereSql[] = 'WHERE 1 = 1 ';
			
			foreach ( $aWhere as $aWhereRow ) {
				$sOperator = strtolower($aWhereRow['where_operator']);
				$aColumn   = $aWhereRow['where_column'];
				$aValue1   = $aWhereRow['where_value1'];
				$sValue2   = $aWhereRow['where_value2'];
				//echo '<div style="background:#ccc;">';pre( $aValue1 );echo '</div>';
				// Force first column and/or value into an array
				$a = array();

				if ( !is_array($aColumn) ) {
					$aColumn = array($aColumn);
				}
				if ( !is_array($aValue1) ) {
					$aValue1 = array($aValue1);
				}
				
				foreach ( $aColumn as $sColumn ) {
					$aWhereColumnSql = array();
					// Now let's build our query
					switch ( $sOperator ) {
						case 'between':
							if ( $aValue1[0] && $sValue2 ) {
								$aWhereColumnSql[] = $sColumn .' BETWEEN (\''.$this->escape( $this->typecast_column_value($sTable, $sColumn, $aValue1[0]) ).'\' AND \''.$this->escape( $this->typecast_column_value($sTable, $sColumn, $aValue2) ).'\') ' .') ';
							}
							
						break;
						case 'beginslike':
						case 'startslike':
							$aWhereColumnSql[] = ' ('. $sColumn .' LIKE ( \''.$this->escape( $this->typecast_column_value($sTable, $sColumn, $aValue1[0]) ).'%\' )' .') ';
							
						break;
						case 'endslike':
							$aWhereColumnSql[] = ' ('. $sColumn .' LIKE ( \'%'.$this->escape( $this->typecast_column_value($sTable, $sColumn, $aValue1[0]) ).'\' )' .') ';
							
						break;
						case 'contains':
						case 'like':
							$aWhereColumnSql[] = ' ('. $sColumn .' LIKE ( \'%'.$this->escape( $this->typecast_column_value($sTable, $sColumn, $aValue1[0]) ).'%\' )' .') ';
							
						break;
						case 'notlike':
							$aWhereColumnSql[] = ' ('. $sColumn .' NOT LIKE ( \'%'.$this->escape( $this->typecast_column_value($sTable, $sColumn, $aValue1[0]) ).'%\' )' .') ';
							
						break;
						case 'lt':
						case '<':
							$aWhereColumnSql[] = ' ('. $sColumn .' < \''.$this->escape( $this->typecast_column_value($sTable, $sColumn, $aValue1[0]) ).'\'' .') ';
							
						break;
						case 'lte':
						case '<=':
						case '=<':
							$aWhereColumnSql[] = ' ('. $sColumn .' <= \''.$this->escape( $this->typecast_column_value($sTable, $sColumn, $aValue1[0]) ).'\'' .') ';
							
						break;
						case 'gt':
						case '>':
							$aWhereColumnSql[] = ' ('. $sColumn .' > \''.$this->escape( $this->typecast_column_value($sTable, $sColumn, $aValue1[0]) ).'\'' .') ';
							
						break;
						case 'gte':
						case '>=':
						case '=>':
							$aWhereColumnSql[] = ' ('. $sColumn .' >= \''.$this->escape( $this->typecast_column_value($sTable, $sColumn, $aValue1[0]) ).'\'' .') ';
							
						break;
						case '!=':
						case '=!':
						case '<>':
						case 'isnot':
							foreach ( $aValue1 as $v ) {
								$a[] = $sColumn .' <> \''.$this->escape( $this->typecast_column_value($sTable, $sColumn, $v) ).'\'';
							}
							$aWhereColumnSql[] = ' ('. implode( ' OR ', $a ) .') ';
							
						break;
						case 'excludes':
							foreach ( $aValue1 as $v ) {
								$a[] = $sColumn .' <> \''.$this->escape( $this->typecast_column_value($sTable, $sColumn, $v) ).'\'';
							}
							$aWhereColumnSql[] = ' ('. implode( ' OR ', $a ) .') ';
						
						break;
						case 'is':
						case '=':
						case 'in':
							/*
							foreach ( $aValue1 as $v ) {
								$a[] = $sColumn .' = \''.$this->escape($v).'\'';
							}
							$aWhereColumnSql[] = ' ('. implode( ' OR ', $a ) .') ';
							*/
							foreach ( $aValue1 as $v ) {
								$a[] = "'".$this->escape( $this->typecast_column_value($sTable, $sColumn, $v) )."'";
							}
							$aWhereColumnSql[] = $sColumn .' IN ('. implode( ', ', $a ) .') ';
						
						break;
						case 'includes':
							foreach ( $aValue1 as $v ) {
								$a[] = $sColumn .' = \''.$this->escape( $this->typecast_column_value($sTable, $sColumn, $v) ).'\'';
							}
							$aWhereColumnSql[] = ' ('. implode( ' OR ', $a ) .') ';
						
						break;
					}
				}
				$aWhereSql[] = ' ('.implode( ') OR (', $aWhereColumnSql ).') ';
			}

			$sSql .= implode( ' AND ', $aWhereSql );
		}
		
		return $sSql;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	private function build_sql_order( $aOrder = array() ) {
		
		if ( $aOrder && is_array($aOrder) && count($aOrder) > 0 ) {
			$aOrderSql   = array();
			
			foreach ( $aOrder as $aOrderRow ) {
				$sColumn    = $aOrderRow['order_column'];
				$sDirection = strtoupper( $aOrderRow['order_direction'] );
				$aOrderSql[] = '['.$sColumn.'] '.$sDirection;
				
			}
			
			$sSql = '';
			
			if ( $aOrderSql && count($aOrderSql) > 0 ) {
				$sSql = ' ORDER BY '. implode(', ', $aOrderSql);
			}
			return $sSql;
		}
	}
	/**
	 * 
	 * @param 
	 * 
	*/
	public function apply_function_alias( $sFunctions ) {
		$sFunctions = str_ireplace('average(', 'avg(', $sFunctions);
		$sFunctions = str_ireplace('ifnull(', 'isnull(', $sFunctions);
		return $sFunctions;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function typecast_column_value( $sTable, $sColumn, $sValue ) {
		
		$aColumnInfo = $this->column_info($sTable, $sColumn);
		$sDatatype   = $aColumnInfo['type'];
		
		if ( $aColumnInfo['null'] == 1 && $sValue === NULL ) {
			return NULL;
		}
		
		//pre(array($sTable, $sColumn, $sValue, $sDatatype));
		switch ( $sDatatype ) {
			case 'bigint':
			case 'int':
			case 'smallint':
			case 'tinyint':
				$sValue = ( int ) $sValue;
				
			break;
			case 'datetime':
			case 'smalldatetime':
				$vContainsFunction = $this->function_check( $sValue, 
					array('DATEADD','DATEDIFF','DATENAME','DATEPART','DAY','MONTH','YEAR','GETDATE','GETUTCDATE')
				);
				if ( !is_numeric( $sValue ) && !is_null($sValue) ) {
					$sValue = strtotime($sValue);
				}
				if (!is_null($sValue))
					$sValue = date( "Y-m-d H:i:s", $sValue );
				
			
			break;
			case 'bit':
				$sValue = ( $sValue ) ? '1' : '0' ; 
				
			break;
			case 'money':
			case 'smallmoney':
				$sValue = number_format($sValue, 4, '.', '');
			break;
			case 'varchar':
			case 'float':
			case 'real':
			case 'decimal':
			case 'numeric':
			case 'char':
			case 'text':
			case 'ntext':
			case 'image':
			case 'nvarchar':
			case 'binary':
			case 'varbinary':
			case 'timestamp':
			case 'uniqueidentifier':
				
			break;
		}
		return $sValue;
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function sql_columns( $sTable ) {
		return mssql_get_last_message();
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function get_message() {
		return mssql_get_last_message();
	}
	
	/**
	 * 
	 * @param 
	 * 
	*/
	public function function_check( $sHaystack, $aFunctions ) {
		
		if ( !is_array($aFunctions) ) $aFunctions = array($aFunctions);
		
		foreach ( $aFunctions as $sFunctionName ) {
			$sFunctionName = strtoupper($sFunctionName).'(';
			if ( stripos($sHaystack, $sFunctionName) ) {
				return TRUE;
			}
			return FALSE;
		}
		
	}
	
	
	
}
?>
