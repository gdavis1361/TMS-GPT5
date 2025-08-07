<?php 
/**
 * User Employees
 *
 * @author Reid Workman
 */
 
class UserEmployees extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_employees';
	var $m_aPodStructure = array();

	public function create(	$nUserId, $sHireDate, $sSSN, $nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_string($sSSN) ) {
			add_error('SSN: ' . $sSSN, $key);
			return false;
		}
		if ( !is_numeric($nUserId) ) {
			add_error('User Id: ' . $nUserId, $key);
			return false;
		}
		if ( !is_string($sHireDate) ) {
			add_error('Hire Date Id: ' . $sHireDate, $key);
			return false;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return false;
		}
		
		// Save Data
		$this->set( 'ssn_no', $sSSN );
		$this->set( 'user_id', $nUserId );
		$this->set( 'hire_date', $sHireDate );
		
		if ( !$this->is_loaded() ) $this->set_created_by_id($nCreatedById);
		else {
			// Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at( time() );
		}
		
		return $this->save();
		
	}
	
	// Lists all employees (that aren't pod captains) under one or more user_ids
	public function list_employees($aUserId, $nDepth=-1) {
		if ($nDepth === 0) { 
			return (array)$aUserId;
		}else if ($nDepth === 1) {
			// don't include pod captains
			$this->connect();
			$q = "SELECT r.user_id, p.pod_id, p.pod_captain_id, p.parent_pod_id FROM user_pods p
					LEFT JOIN user_employee_to_pod r ON r.pod_id = p.pod_id
					WHERE p.pod_captain_id IN ( '" . implode("', '", (array)$aUserId) . "' ) AND r.user_id != p.pod_captain_id";

			$result = $this->query($q);

			$a = array();
			while( $r = $this->db->fetch_array($result) )  {
				
				$a[] = $r['user_id'];
			}
			return array_merge( (array)$aUserId, (array)$this->list_employees($a, $nDepth - 1) );
		}else{
			// Include pod captains
			$aList = array();
			$oSupervisor = new UserEmployeeToSupervisor();
			
			$oSupervisor->clear_filters();
			$oSupervisor->where('supervisor_id', '=', $aUserId);
			$oSupervisor->where('active', '=', 1);
			$a = $oSupervisor->list()->rows;
			//info();
			if ( empty($a) ) return (array)$aUserId;
			foreach ($a as $row) { 
				$aList[] = $row->get('user_id');
			}
			$nNewDepth = ($nDepth > 0 ? $nDepth - 1 : $nDepth);
			return array_merge( (array)$aUserId, (array)$this->list_employees($aList, $nNewDepth ) );
		}
	}
	
	public function list_pod_member_ids($aUserId, $nCommPct) {

		$this->connect();
		$q = "SELECT branch.branch_name, branch.branch_id, team.team_name, team.league_team_id as team_id, rel.user_id, pod.pod_id, pod.pod_captain_id, pod.parent_pod_id, (contact.first_name + ' ' + contact.last_name) as name 
				FROM user_pods pod
				LEFT JOIN user_employee_to_pod rel ON rel.pod_id = pod.pod_id
				LEFT JOIN user_base ON user_base.user_id = rel.user_id
				LEFT JOIN contact_base contact ON contact.contact_id = user_base.contact_id
				LEFT JOIN user_employee_to_team team_rel ON rel.user_id = team_rel.user_id
				LEFT JOIN league_teams team ON team_rel.team_id = team.league_team_id
				LEFT JOIN user_employee_to_branch branch_rel ON rel.user_id = branch_rel.user_id
				LEFT JOIN user_branches branch ON branch_rel.branch_id = branch.branch_id
				WHERE pod.pod_captain_id IN ('" . implode("', '", (array)$aUserId) . "' )";

		$result = $this->query($q);

		$a = array();
		while( $r = $this->db->fetch_array($result) ){
			$a[$r['pod_id']][$r['user_id']] = array(
						'user_id' => $r['user_id'],
						'pod_id' => $r['pod_id'],
						'is_captain' => ($r['user_id'] == $r['pod_captain_id'] ? '1': '0'),
						'name' => $r['name'],
						'team_name' => $r['team_name'],
						'team_id' => $r['team_id'],
						'branch_name' => $r['branch_name'],
						'branch_id' => $r['branch_id']
						// More info about each member ...
				);
			if ($nCommPct == 1) {
				if ($r['user_id'] == $r['pod_captain_id']) {
					$a[$r['pod_id']][$r['user_id']]['comm_pct'] = 1;
				}else{
					$a[$r['pod_id']][$r['user_id']]['comm_pct'] = .6;
				}
			}else{
				$a[$r['pod_id']][$r['user_id']]['comm_pct'] = round($nCommPct, 5);
			}
		}
		return $a;
	}

	public function pod_structure($aUserId, $nCommPct=1) {
		if ($nCommPct == 1) {
			$this->m_aPodStructure = array();
		}
		
		$aPodMembers = $this->list_pod_member_ids($aUserId, $nCommPct);

		if ($nCommPct == 1) $nCommPct = .3;
		else $nCommPct = $nCommPct / 2;

		$aPodIds = array();
		foreach($aPodMembers as $nPodId => $aPod) {
			$aPodIds[] = $nPodId;
		}
		if ( count($aPodIds) > 0) {
			$aPodLeaders = $this->list_pod_leaders($aPodIds);
			$this->m_aPodStructure[] = $aPodMembers;
			return $this->pod_structure($aPodLeaders, $nCommPct);
		}else{
			return $this->m_aPodStructure;
		}
	}

	public function list_pod_leaders($aParentPodId) {
		$this->connect();
		$q = "SELECT pod_captain_id FROM user_pods
				WHERE parent_pod_id in ('" . implode("', '", $aParentPodId) . "')";

		$result = $this->query($q);
		$a = array();
		while( $r = $this->db->fetch_array($result) ){
			$a[] = $r['pod_captain_id'];
		}
		return $a;

	}
	
	private function pull_user_ids($a){
		$aIds = array();
		//echo "<br>pull using: " . print_r($a, 1);
		foreach($a as $k => $item) {
			if ( is_array($item) ) $aIds = array_merge($aIds, $this->pull_user_ids($item) );
			else if ( $k == 'user_id' ) $aIds[] = $item;
		}
		return $aIds; //mkay
			
	}
	
	public function list_user_scope($aUserIds) {
		$a = $this->pull_user_ids( (array)$this->pod_structure($aUserIds) );
		return empty($a) ? $aUserIds : $a;
	}
	
	public function list_pod_mates($nUserId=NULL){
		if ($nUserId==NULL) $nUserId = get_user_id ();
		
		$s = "SELECT user_id FROM user_employee_to_pod rel
				WHERE pod_id = (SELECT TOP 1 pod_id FROM user_employee_to_pod WHERE user_id = '$nUserId' AND active='1')";
		$aTmp = LP_Db::fetchAll($s);
		$a = array();
		foreach($aTmp as $row) $a[] = $row['user_id'];
		return $a;
	}
	
	public function list_manageable_contacts($nUserId) {
		$aContactScope = $this->list_user_scope( array( $nUserId ) );
		
		$aMyUsers = $this->list_pod_mates($nUserId);
		$aContactScope = array_merge($aContactScope, $aMyUsers);
		// ManageableContacts is a list of all contact_ids that this user is allowed to view according to hierarchy
		$aManageableContacts = array();
		$oOwners = new ContactOwners();
		foreach( $oOwners->list_contacts_by_user($aContactScope) as $tmp ) {
			$aManageableContacts[] = $tmp['contact_id'];
		}
		
		return $aManageableContacts;
	}
	
	public function update_contact_scope($nUserId = ''){
		if (empty($nUserId)) $nUserId = get_user_id();
		//if its STILL empty...
		if (empty($nUserId)) return false;
		
		//Update session contact lists to reflect new contact.
		$oEmployee = new UserEmployees();
		$aPodStructure = $oEmployee->pod_structure( array( $nUserId ), 1 );

		//$aContactScope = $oEmployee->list_manageable_contacts( get_user_id() );
		
		$aUserScope = UserEmployees::getSupervisees($nUserId);
		$aContactScope = ContactBase::getContactIds($aUserScope);
		$oSession = $GLOBALS['oSession'];
		$oSession->session_var( 'pod_structure', $aPodStructure );
		$oSession->session_var( 'contact_scope', $aContactScope );
		$oSession->session_var( 'user_scope', $aUserScope );
		$oSession->session_save();
	}
	
	
	public static function getSupervisees($aId) {
		if (!is_array($aId)) $aId = array(intval($aId));

		$s = "SELECT user_id FROM user_employee_to_supervisor
			WHERE supervisor_id IN (" . implode(", ", $aId) . ")";

		$aUsers = array();
		foreach (LP_Db::fetchAll($s) as $row) $aUsers[] = $row['user_id'];
			
		$aNewUsers = array_diff($aUsers, $aId);
		
		if (count($aNewUsers))
			return array_merge($aId, self::getSupervisees($aNewUsers));
		else
			return array_merge($aId, $aNewUsers);
	}
	
}