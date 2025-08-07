<?php 
/**
 * Posting Service Credentials
 *
 * @author Steve Keylon
 */

class PostingServiceCredentials extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'posting_service_credentials';

	public function create( $aVars ) {
		
		$sLogin = isset($aVars['login']) ? $aVars['login'] : '';
		$sPassword = isset($aVars['password']) ? $aVars['password'] : '';
		$nCreatedById = isset($aVars['created_by_id']) ? $aVars['created_by_id'] : get_user_id();
		// Validate input
		$key = __CLASS__ . '::' . __METHOD__;
		if ( empty($sLogin) ) {
			add_error('Invalid Login: '. $sLogin, $key);
			return FALSE;
		}
		
		if ( empty( $sPassword ) ) {
			add_error('Password cannot be empty: ' . $sPassword, $key);
			return FALSE;
		}
		
		// Save Input
		$this->set('login', addslashes( $sLogin ) );
		$this->set('password', $sPassword );
		$nCreatedByIdTmp = $this->get_created_by_id();
		$vCreate = empty( $nCreatedIdTmp ) ;
		if ($vCreate) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}
		$this->save();
		
		// Report
		return true;
	}
	
	function list_credentials_by_service($nServiceId) {
		$this->connect();
		$s = "SELECT * FROM tms.dbo.posting_service_credentials
		WHERE posting_service_id = '" . stripslashes($nServiceId) . "'";
		
		$res = $this->query($s);
		$a = array();
		while ($row = $this->db->fetch_object($res) ) {
			$a[] = $row;
		}
		return $a;
	}
}
