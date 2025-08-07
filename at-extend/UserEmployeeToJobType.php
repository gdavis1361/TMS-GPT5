<?php 
/**
 * User Employee to Job Type
 *
 * @author Reid Workman
 */
 
class UserEmployeeToJobType extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_employee_to_job_type';

	public function create(	$nUserId, $nJobTypeId, $vActive, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nUserId) ) return FALSE;
		if ( !is_numeric($nBranchId) ) return FALSE;
		if ( !is_string($sBranchName) ) return FALSE;
		if ( !is_bool($vActive) ) return FALSE;
	
		// Get New Activity Id
		$nJobIndex = $this->current_index( $nUserId, $nJobTypeId ) + 1;
		
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
		
		return TRUE;
	}

	public function current_index( $nUserId, $nJobTypeId ) {
		$res = $this->query('
			SELECT max(job_index) as LAST_ID
			FROM '.$this->m_sTableName.'
			WHERE user_id = '.$nUserId.'
				  job_type_id = '.$nJobTypeId.'
		');
		if ( $this->db->num_rows($res) > 0 && $row = $this->db->fetch_object($res) ) {
			return $row->LAST_ID;
		}
		else {
			return 0;
		}
	}
	
	public function remove_from_job_type( $nUserId, $nUpdatedUserId ) {
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
	
}

?>