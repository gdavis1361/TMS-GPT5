<?php 
/**
 * User Employee to Team
 *
 * @author Reid Workman
 */
 
class UserEmployeeToTeam extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_employee_to_team';

	public function create(	$nUserId, $nTeamId ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nUserId) ){
			add_error('User Id: ' . $nUserId, $key);
			return false;
		}
		if ( !is_numeric($nTeamId) ) {
			add_error('Team Id: ' . $nTeamId, $key);
			return false;
		}
	
		// Get New Activity Id
		$nTeamIndex = $this->count_index( $nUserId, $nTeamId ) + 1;
		
		// Other Records exist, ensure they are inactive
		if ( $nTeamIndex > 1 ) {
			$this->remove_from_Team( $nUserId, $nCreatedById );
		}
		
		// Save Data
		$this->set( 'user_id', $nUserId );
		$this->set( 'team_id', $nTeamId );
		$this->set( 'team_index', $nTeamIndex );
		$this->set( 'active', 1 );

		$this->set( 'start_date', date('Y-m-d') );
		
		$this->save();
		
		return TRUE;
	}
	
	public function count_index($nUserId) {
		$this->where('team_index', '=', $nUserId);
		return count($this->list()->rows);
	}
	
	public function get_user_team($nUserId) {		
		$s = "SELECT TOP 1 team_id 
				FROM " . $this->m_sTableName . " 
				WHERE 
					user_id = '$nUserId'
				AND
					active = 1
				ORDER BY 
					team_index DESC";
		$this->connect();
		$r = $this->query($s);
		if ($row = $this->db->fetch_object($r)){
			return $row->team_id;
		}
		return 0;
	}

	public function remove_from_Team( $nUserId, $nUpdatedUserId ) {
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