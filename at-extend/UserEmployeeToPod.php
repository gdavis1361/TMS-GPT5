<?php 
/**
 * User Employee to Pod
 *
 * @author Reid Workman
 */
 
class UserEmployeeToPod extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_employee_to_pod';

	public function create(	$nPodId, $nUserId ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nUserId) ){
			add_error('User Id: ' . $nUserId, $key);
			return false;
		}
		if ( !is_numeric($nPodId) ) {
			add_error('Pod Id: ' . $nPodId, $key);
			return false;
		}

		$this->remove_from_pod( $nUserId );
		
		// Save Data
		$this->set( 'user_id', $nUserId );
		$this->set( 'pod_id', $nPodId );
		$this->set( 'active', 1 );
		
		$this->save();
		
		return TRUE;
	}

	public function remove_from_pod( $nUserId ) {
		$this->where('user_id', '=', $nUserId);
		$this->where('active', '=', '1');
		$oResult = $this->update( array('active' => '0') );

		if ( $oResult->affected_rows > 0 ) {
			return TRUE;
		}
		return FALSE;
	}
	
	public function findByCaptainName($sName){
		$aParts = explode_name($sName);
		$sFirstName = $aParts['first_name'];
		$sMiddleName = $aParts['middle_name'];
		$sLastName = $aParts['last_name'];
		$sPreferredName = $aParts['preferred_name'];
		
		$aWhere = array();
		
		if (!empty($sFirstName)) $aWhere[] = "contact.first_name LIKE '{$aParts['first_name']}'";
		if (!empty($sLastName)) $aWhere[] = "contact.last_name LIKE '{$aParts['last_name']}'";
		$s = "SELECT TOP 1 pod_id FROM user_employee_to_pod
				LEFT JOIN user_base ON user_base.user_id = user_employee_to_pod.user_id
				LEFT JOIN contact_base contact ON contact.contact_id = user_base.contact_id
				WHERE 1=1 ". (!empty($aWhere) ? " AND " : ''). implode(' AND ', $aWhere);
		$o = LP_Db::fetchRow($s);
		
		return $o['pod_id'];
	}
	
}

?>