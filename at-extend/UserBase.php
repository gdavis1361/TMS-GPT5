<?php 
/**
 * User Base
 *
 * @author Reid Workman
 */

class UserBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_base';

	public function create(	$nContactId, $nRoleId,
							$sPassword, $sUsername,
							$nCreatedById
						  ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		
		if ( !is_numeric($nContactId) ) {
			add_error('Contact Id: ' . $nContactId, $key);
			return false;
		}
		if ( !is_numeric($nRoleId) ) {
			add_error('Role Id: ' . $nRoleId, $key);
			return false;
		}
		if ( !is_string($sPassword) ) {
			add_error('Password requires a string: ', $key);
			return false;
		}
		if ( !is_string($sUsername) ) {
			add_error('Username: '. $sUsername, $key);
			return false;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return false;
		}
		
		// Password Stuff
		$sPasswordSalt = $this->generate(35);
		$sPassword = $this->generate_hash($sPassword, $sPasswordSalt) ;
		
		// Save Data
		$this->set( 'contact_id', $nContactId );
		$this->set( 'role_id', $nRoleId );
		$this->set( 'password', $sPassword );
		$this->set( 'salt', $sPasswordSalt );
		$this->set( 'user_name', $sUsername );
		$this->set( 'total_logins', 0 );
		
		if ( !$this->is_loaded() ) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at( time() );
		}
		
		return $this->save();
	}
	
	public function check_password( $sPasswordChallenge, $sSalt, $sPasswordHash ) {
		
		$sPassword = $this->generate_hash( $sPasswordChallenge, $sSalt ) ;
		
		if ( $sPassword == $sPasswordHash ) {
			return TRUE;
		}
		else {
			return FALSE;
		}
		
	}
	
	public function set_password( $nUserId, $sPassword ) {
		
		$sPasswordSalt = $this->generate(35);
		$sPassword = $this->generate_hash( $sPassword, $sPasswordSalt ) ;
		
		$this->load( $nUserId );
		$this->set( 'password', $sPassword );
		$this->set( 'salt', $sPasswordSalt );
		
		if ( $this->save() ) {
			return $this->get('user_id');
		}
		else {
			return FALSE;
		}
		
	}

	public function user_info( $nUserId = FALSE ) {
		if( !$nUserId ) {
			if ( $this->get('user_id') ) {
				$nUserId = $this->get('user_id');
			}else {
				return (object)'';
			}
		}
		$this->load($nUserId);
		return $this;
	}
	
	public function authenticate_by_username( $sUsername, $sPassword ) {
		if ( empty($sUsername) ) return FALSE;
		if ( empty($sPassword) ) return FALSE;
		
		// Lookup by Username
		$this->where( 'lower(user_name)', '=', strtolower($sUsername) );
		$this->limit( 1 );
		$oUsers = $this->list(); 
		if ( count($oUsers->rows) > 0 ) {
			$oRow = $oUsers->rows[0];
			$oUser = new UserBase();
			$oUser->load( $oRow->get('user_id') );
			if ( $this->check_password( $sPassword , $oUser->get('salt'), $oUser->get('password') ) ) {
				$oReturn = (object) '';
				$oReturn->user_id = $oUser->get('user_id');
				$oReturn->user_name = $oUser->get('user_name');
				$oReturn->role_id = $oUser->get('role_id');
				$oReturn->contact_id = $oUser->get('contact_id');
				$oReturn->last_login = $oUser->get('last_login');
				$oReturn->total_logins = $oUser->get('total_logins');
				$oEmployee = $oUser->get_Employee();
				$oReturn->pod_structure = $oEmployee->pod_structure( array($oUser->get('user_id')), 1 );
				
				
				//$oReturn->contact_scope = $oEmployee->list_manageable_contacts( $oUser->get('user_id') );
				//$oReturn->user_scope = $oEmployee->list_user_scope( array( $oUser->get('user_id') ) );
				
				$this->increment_login( $oUser->get('user_id') );
				
				return $oReturn;
			}
		}

		return FALSE;
	}
	
	public function increment_login( $nUserId ) {
		$this->where( 'user_id', '=', $nUserId  );
		$this->update(array(
			'total_logins' => array('','total_logins + 1'),
			'last_login' => time()
		));
	}

	private function generate_hash( $sPassword, $sSalt ) {
		return md5( sha1( '#'. $sPassword .':'. $sSalt .'@&'. $sSalt .'!' ) );
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
	
	function get_Contact() { 
		$oContact = new ContactBase();
		$oContact->load( $this->get_Contact_id() );
		return $oContact;
	}
	
	public function getContact() {
		$contact = new ContactBase();
		$contact->load($this->get('contact_id'));
		return $contact;
	}
	
	public function getContactName() {
		$contact = $this->getContact();
		return $contact->getName();
	}
	
	function get_Employee($nUserId = false) { 
		if (!$nUserId) $nUserId = $this->get('user_id');
		$o = new UserEmployees();
		$o->load( $nUserId );
		return $o;
	}
	
	function get_branch($nUserId = false) { 
		if (!$nUserId) $nUserId = $this->get('user_id');
		$oRel = new UserEmployeeToBranch();
		$oRel->load( array('user_id' => $nUserId, 'active' => '1' ) );
		$o = new UserBranches();
		$o->load($oRel->get('branch_id') );
		return $o;
	}
	
	function trigger_add_contact() {
		//$oLeagueStats = new LeagueStats();
		//$oLeagueStats->load_by_user( $this->get_user_id() );
		//$oLeagueStats->trigger_add_contact();
	}
	
	function list_contacts() {
		$o = new ContactOwners();
		echo $this->get_user_id() . " is the user id";
		return $o->list_contacts_by_user( $this->get_user_id() , true);
	}
	
	function get_contact_name($nUserId = false, $vFirstLast = true) {
	
		if (!$nUserId) $nUserId = $this->get('user_id');
		if (!$nUserId) return "invalid user id";
			
		$this->connect();
		if ($vFirstLast) {
			$sName = "contact.first_name + ' ' + contact.last_name";
		}else{
			$sName = "contact.last_name + ', ' + contact.first_name";
		}
		
		$sql = "SELECT (".$sName.") as name FROM " . $this->m_sTableName . "
					LEFT JOIN contact_base contact ON contact.contact_id = user_base.contact_id
					WHERE user_base.user_id = '" . $nUserId . "'";
					
		$res = $this->db->query($sql);
		
		$a = $this->db->fetch_array($res);
		
		if ($a) {
			return $a['name'];
		}
		return "not a";
	}
	
	public function username_exists($sUser){
		$this->connect();
		$query = "SELECT COUNT(*) count
					FROM $this->m_sTableName
					WHERE user_name = '$sUser'";
		$result = $this->db->query($query);
		if($this->db->num_rows($result)){
			$row = $this->db->fetch_assoc($result);
			if($row['count']){
				return true;
			}
		}
		return false;
	}
	
	public function get_reset_password_hash(){
		return md5($this->get_reset_password_string());
	}
	
	public function get_reset_password_string(){
		return implode('-', array(
			$this->get('user_id'),
			$this->get('user_name'),
			date('n/j/Y')
		));
	}
	
	public function load_from_reset_password_hash($hash){
		//SELECT TOP 1 * FROM [TMS].[dbo].[user_base] WHERE CONVERT(varchar(32), HashBytes('MD5', CAST(user_id as varchar) + '-' + user_name + '-' + '5/20/2011'), 2) = 'dd1b1744d301926304ded0349836c827';
		$this->connect();
		$date = date('n/j/Y');
		$query = "SELECT user_id 
					FROM $this->m_sTableName
					WHERE CONVERT(
						varchar(32),
						HashBytes(
							'MD5',
							CAST(user_id as varchar) + '-' + user_name + '-' + '$date'
						),
						2
					) = '$hash'";
		$result = $this->db->query($query);
		if($this->db->num_rows($result)){
			$row = $this->db->fetch_assoc($result);
			$this->load($row['user_id']);
		}
	}
	
	public static function getMyId() {
		$userId = 0;
		if (isset($GLOBALS['oSession'])) {
			$userId = intval($GLOBALS['oSession']->get( 'user_id' ));
		}
		return $userId;
	}
	
	public static function getMyUser() {
		$userBase = new UserBase();
		$userBase->load(self::getMyId());
		return $userBase;
	}
	
	public function findByUserName($sName){
		$this->clear_filters();
		$this->where('user_name', '=', $sName);
		$a = $this->list()->rows;
		if ( isset($a[0]) ) {
			return $a[0]->get('user_id');
		}
		return 0;
	}
	
}
