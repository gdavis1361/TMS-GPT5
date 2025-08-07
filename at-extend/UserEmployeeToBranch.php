<?php 
/**
 * User Employee to Branch
 *
 * @author Reid Workman
 */
 
class UserEmployeeToBranch extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_employee_to_branch';

	public function create(	$nUserId, $nBranchId, $vActive, $nCreatedById ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nUserId) ){
			add_error('User Id: ' . $nUserId, $key);
			return false;
		}
		if ( !is_numeric($nBranchId) ) {
			add_error('Branch Id: ' . $nBranchId, $key);
			return false;
		}
		
	
		// Get New Activity Id
		$nBranchIndex = $this->current_index( $nUserId, $nBranchId ) + 1;
		
		// Other Records exist, ensure they are inactive
		if ( $nBranchIndex > 1 ) {
			$this->remove_from_branch( $nUserId, $nCreatedById );
		}
		
		// Save Data
		$this->set( 'user_id', $nUserId );
		$this->set( 'branch_id', $nBranchId );
		$this->set( 'branch_index', $nBranchIndex );
		$this->set( 'active', $vActive );
		
		$this->set( 'started_by_id', $nCreatedById ); 
		$this->set( 'start_date', time() );
		
		$this->save();
		
		return true;
		
	}

	public function current_index( $nUserId, $nBranchId ) {
		
		$this->connect();
		$res = $this->query('
			SELECT max(branch_index) as LAST_ID
			FROM '.$this->m_sTableName."
			WHERE user_id   = '". $nUserId ."' AND 
				  branch_id = '". $nBranchId ."'");
		if ( $this->db->num_rows($res) > 0 && $row = $this->db->fetch_object($res) ) {
			return $row->LAST_ID;
		}
		else {
			return 0;
		}
	}

	public function remove_from_branch( $nUserId, $nUpdatedUserId ) {
		$this->where('user_id', '=', $nUserId);
		$this->where('active', '=', '1');
		$oResult = $this->update(array(
			'active' => '0',
			'end_date' => time(),
			'ended_by_id' => $nUpdatedUserId
		));
		
		if ( $oResult->affected_rows > 0 ) { 
			return TRUE;
		}
		return FALSE;
	}
	
	public function get_user_branch($nUserId) {		
		$s = "SELECT TOP 1 branch_id 
				FROM " . $this->m_sTableName . " 
				WHERE 
					active = 1
				ORDER BY 
					branch_index DESC";
		$this->connect();
		$r = $this->query($s);
		if ($row = $this->db->fetch_object($r)){
			return $row->branch_id;
		}
		return 0;
	}
}

?>