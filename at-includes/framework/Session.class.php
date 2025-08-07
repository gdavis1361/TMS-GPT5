<?php
/*
	Session
	
	// Set and save a varaible to a new session
	$oSession->session_var( 'last_item_id', 48 );
	$oSession->session_var( 'cart_items', 4 );
	$oSession->session_var( 'new_customer', FALSE );
	$oSession->session_save(); // Sets a cookie should none exist ( Saves a variable )
	
	
	if ( $oSession->session_var( 'new_customer' ) {
		echo 'Welcome back!';
	}
	else {
		echo 'Hello new user!';
	}
	// Hello new user!
	
	echo $oSession->session_var( 'cart_items' ); // 4
	
	
	$oSession->session_unset( 'cart_items' );
*/


class Session extends DBModel {
	// DbObject
	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_sessions';
	
	
	// Sessions Variables
	var $nSessionId   = 0;
	var $sPublicHash  = '';
	var $aSessionData = array();
	
	var $nSessionTimeout = 0;
	var $nDeleteExpired  = 0;
	var $sCreateNew      = '';
	var $sExtendOnActive = '';
	var $sPreventHosts   = '';
	var $sExpireEvent    = '';
		
	/*
		Constructor( )
		nSessionTimeout || Default: 1 day
			Expire x seconds since last activity
		nDeleteExpired || Default: 1 week
			Delete session record after x seconds of expiration
		sCreateNew
			Always       - Always Create new session if expired or non-existent
			Force        - Force Overwrites any previous session with a new session
			OnDemand [D] - Create New Session when new data is given to the session
			Never        - Disable Sessions (why?)
		sExtendOnActive
			Always [D]   - Always extend whenever session is called
			OnUpdate     - Whenever Session updates data
			Never        - Never Extend Session
		sPreventHosts
			BotsVoids    - Never Create Sessions 'Voids' & 'Bots'
			Voids        - Never Create Sessions for blank hostnames
			Bots         - Never Create Sessions for self-identified bots
			Never        - Never Prevent Sessions from creation based on hostname
		nExpireEvent
	*/
	function __construct( $nSessionTimeout = FALSE, $nDeleteExpired = FALSE, $sCreateNew = 'OnDemand', $sExtendOnActive = 'Always', $sPreventHosts = 'Never', $sExpireEvent = '' ) {
		/*
			_su  = "Session User" ID (int)
			_spk = "Session Public Key"  (32 md5 string)
		*/
		
		$this->nSessionId   = cookie('_su');
		$this->sPublicHash  = cookie('_spk');

		$this->sCreateNew      = strtoupper($sCreateNew);
		$this->sExtendOnActive = strtoupper($sExtendOnActive);
		$this->sPreventHosts   = strtoupper($sPreventHosts);
		$this->sExpireEvent    = strtoupper($sExpireEvent);
		
		// Set Defaults
		$this->nSessionTimeout = ( 60 * 60 * 24 * 1 ); // 1 day
		$this->nDeleteExpired  = ( 60 * 60 * 24 * 7 ); // 1 week
		
		// Set provided (if any) session defaults
		if ( is_numeric($nSessionTimeout) && $nSessionTimeout > 0 )
			$this->nSessionTimeout = $nSessionTimeout;
			
		if ( is_numeric($nDeleteExpired) && $nDeleteExpired > 0 )
			$this->nDeleteExpired = $nDeleteExpired;
			
		// Check for existing Session
		if ( $this->session_exists( $this->nSessionId, $this->sPublicHash ) ) {
			// Update local Variables
			if ( strlen($this->get('data')) > 0 ) {
				$this->session_set_vars( unserialize($this->get('data')) );
			}
			
			// Update Cookies
			if ( $this->sExtendOnActive == 'ALWAYS' ) {
				$this->update_cookies();
			}
			
		}
		
		set_session($this);
		
	}
	
	public function session_exists( $nSessionId = FALSE, $sPublicHash = FALSE ) {
		$nSessionId = ( $nSessionId ) ? $nSessionId : $this->nSessionId;
		$sPublicHash = ( $sPublicHash ) ? $sPublicHash : $this->sPublicHash;
		addNote( '[SESSION] Exists?: SessionID: '.$nSessionId .' * '.$sPublicHash );
		if ( is_numeric($nSessionId) && $nSessionId > 0 && $this->load( $nSessionId ) ) {
			addNote( '[SESSION] SessionID Loaded: '.$nSessionId );
			
			// Check if still active
			$nLastActive = strtotime( $this->get('date_active') );
			$nExpireTime = ( strlen( $this->get('expire_date') ) > 0 ) ? strtotime( $this->get('expire_date') ) : $nLastActive + $this->get('expire_timeout') ;
			
			addNote( '[SESSION] E: '. ( $nExpireTime - time() ) .'s Remain' );
			
			if ( $nLastActive >= $nExpireTime ) {
				addNote( '[SESSION] E: Session Expired' );
				$this->unload();
				return FALSE;
			}
			
			// Check if Hash can be recreated
			addNote( "[SESSION]\nPublic Hash:     ".$this->sPublicHash."\nPrivate Hash:    ".$this->get_Private_Key()."\nShould Generate: ".$this->get_Hash()."\nBut Generated:   ".$this->generate_hash( $sPublicHash, $this->get_Private_Key() ) );
			if ( $this->get_Hash() != $this->generate_hash( $sPublicHash, $this->get('private_key') ) ){
				addNote( '[SESSION] E: Hash Mismatch: '.$this->get_Hash().' >= '.$this->generate_hash( $sPublicHash, $this->get_Private_Key() ) );
				$this->unload();
				return FALSE;	
			}
			
			addNote( '[SESSION] E: Valid Session' );
			return $nSessionId;
		}
		
		return FALSE;
	}
	
	private function create_session() {
		addNote('[SESSION] Create Session');
		if ( $this->sCreateNew == 'NEVER' )
			return FALSE;
		
		// Creates New Session
		$sPublic_Key  = md5( sha1( sha1( $this->generate() ) ) );
		$sPrivate_Key = generate();
		$sHash        = $this->generate_hash( $sPublic_Key, $sPrivate_Key );
		
		$this->expire_cookies();
		
		$this->set_Private_Key( $sPrivate_Key );
		$this->set_Hash( $sHash );
		$this->set_IP( (isset($_SERVER["HTTP_X_FORWARDED_FOR"])) ? $_SERVER["HTTP_X_FORWARDED_FOR"] : $_SERVER['REMOTE_ADDR'] );
		$this->set_Date_Created( time() );
		$this->set_Date_Active( time() );
		//$this->set_Expire_Date( NULL );
		$this->set_Expire_Timeout( $this->nSessionTimeout );
		$this->set_Data( ); //serialize($this->aSessionData)
		
		addNote( '[SESSION] Attempt to create new session' );
			
		if ( $this->save() ) {
			addNote( '[SESSION] New Session Record '.$this->get_Id());
			$this->nSessionId  = $this->get( 'id' );
			$this->sPublicHash = $sPublic_Key;
			
			switch ( $this->sExtendOnActive ) {
				case 'ALWAYS':
				case 'ONUPDATE':
					$this->update_cookies();
			}
			return true;
		}
	}
	
	public function session_var( $sVarName, $sVarValue = NULL ) {
		if ( isset($this->aSessionData[$sVarName]) && is_null($sVarValue) ) {
			return $this->aSessionData[$sVarName];
		} elseif ( !is_null($sVarValue) ) {
			$this->aSessionData[$sVarName] = $sVarValue;
			return TRUE;
		}
		return NULL;
	}
	
	private function session_set_vars( $aVariables ) {
		if ( is_array($aVariables) && count($aVariables) > 0 ) {
			foreach ( $aVariables as $sVariable => $sValue ) {
				$this->session_var( $sVariable, $sValue );
			}
			return TRUE;
		}
		return FALSE;
	}
	
	public function session_dump( ) {
		return serialize($this->aSessionData);
	}

	public function session_unset( $sVarName ) {
		 if ( isset($this->aSessionData[$sVarName]) ) {
		 	unset( $this->aSessionData[$sVarName] );
		 }
	}
	
	public function session_unset_all() {
		 $this->aSessionData = array();
	}
	
	public function session_expire() {
		if ( $this->session_exists() ) {
			//$this->set_Expire_Date( NULL );
			$this->set_Expire_Timeout( -1 );
			$this->set_Date_Active( time() );
			$this->save();
			$this->expire_cookies();
			return TRUE;
		}
		return FALSE;
	}
	
	public function session_save() {
		// Load Record if session exists
		if ( $nId = $this->session_exists() ) {
			$this->load( $nId );
		}
		else {
			$this->create_session();
		}
		
		// Set and Save
		if ( count($this->aSessionData) > 0 ) {
			$this->set_data( serialize($this->aSessionData) );
		}
		else {
			$this->set_data( NULL );
		}
		$this->set_Date_Active( time() );
		$this->save();
		switch ( $this->sExtendOnActive ) {
			case 'ALWAYS':
			case 'ONUPDATE':
				$this->update_cookies();
		}
		
		return FALSE;
	}
	
	
	// Updates an existing session should it exist
	private function update_cookies( $nSessionId = FALSE, $sPublicHash = FALSE ) {
		$nSessionId = ( $nSessionId ) ? $nSessionId : $this->nSessionId;
		$sPublicHash = ( $sPublicHash ) ? $sPublicHash : $this->sPublicHash;
		
		if( !headers_sent() ) {
			$this->set_Date_Active( time() );
			$this->save();
			setcookie( '_su',  $nSessionId, time()+$this->nSessionTimeout, '/' );
			setcookie( '_spk', $sPublicHash, time()+$this->nSessionTimeout, '/' );
		}
	}
	
	private function expire_cookies() {
		if( !headers_sent() ) {
			setcookie( '_su',  '', time()-( 60 * 60 * 24 * 1 ), '/' );
			setcookie( '_spk', '', time()-( 60 * 60 * 24 * 1 ), '/' );
		}
	}

	// Discard old expired sessions after grace period
	public function session_cleanup() {
		/* 
			SQL Reads:
			DELETE 
				rows
			FROM TABLE 
			WHERE
				    (the last active session)
				  + (allocated session time)
				  + (deletion grace period)
				  is greater than the current time
				AND 
				  not flagged for any reason
		*/
		/*
		$this->query('
			DELETE FROM 
				'..'
			WHERE 
				( 
					  UNIX_TIMESTAMP(date_active)
					+ IFNULL( expire_timeout, UNIX_TIMESTAMP(date_active) - UNIX_TIMESTAMP(expire_date) ) 
					+ '. $this->nDeleteExpired .'					
				) > UNIX_TIMESTAMP()
				AND 
					flagged = NULL
		');
		*/
		return;
	}

	private function generate( $chars = 32 ) {
		$c='0987654321ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		
		$cl=strlen($c);
		$str='';
		for($x=0;$x<$chars;$x++)
		{
			$str.=substr($c,rand(0,$cl),1);
		}
		return $str;
	}

	private function generate_hash( $sPublic, $sPrivate ) {
		return md5( sha1( '#'.$sPublic .'@'. $sPrivate.'!' ) );
	}

	private function setup() {
		// Create New Table
		$this->query("
			SET SQL_MODE=\"NO_AUTO_VALUE_ON_ZERO\";
			
			CREATE TABLE IF NOT EXISTS `ai_sessions` (
				`id` int(10) unsigned NOT NULL default '0',
				`hash` varchar(32) NOT NULL default '',
				`private_key` varchar(32) NOT NULL default '',
				`date_created` datetime NOT NULL default '0000-00-00 00:00:00',
				`date_active` datetime NOT NULL default '0000-00-00 00:00:00',
				`expire_date` datetime default NULL,
				`expire_timeout` int(10) unsigned default NULL,
				`ip` varchar(45) NOT NULL default '',
				`data` text,
				`flagged` tinyint(1) default NULL,
				PRIMARY KEY (`id`),
				KEY `expired` (`date_active`,`expire_date`,`expire_timeout`,`flagged`)
			) ENGINE=MyISAM DEFAULT CHARSET=latin1;
		");
		
		// Future Support with dbforge
		/*
		$fields = array(
			'id' => array(
				'type' => 'id'
			),
			'hash' => array(
				'type' => 'VARCHAR',
				'constraint' => '32',
				'null' => FALSE
			),
			'private_key' => array(
				'type' => 'VARCHAR',
				'constraint' => '32',
				'null' => FALSE
			),
			'date_created' => array(
				'type' =>'DATETIME',
				'null' => FALSE
			),
			'date_active' => array(
				'type' =>'DATETIME',
				'null' => FALSE
			),
			'expire_date' => array(
				'type' =>'DATETIME',
				'null' => TRUE
			),
			'expire_timeout' => array(
				'type' =>'INT',
				'constraint' => '10',
				'null' => TRUE
			),
			'ip' => array(
				'type' => 'VARCHAR',
				'constraint' => '45',
				'null' => FALSE
			),
			'data' => array(
				'type' => 'TEXT',
				'null' => TRUE
			),
			'flagged' => array(
				'type' =>'INT',
				'constraint' => '1',
				'null' => TRUE
			)
		);
		
		$this->dbforge->add_key(array('date_active','expire_date','expire_timeout','flagged'));
		$this->dbforge->create_table($this->m_sTableName, TRUE);
		*/
		return TRUE;
	}
	
}

?>