<?php
/**
 * User Employee to Supervisor
 *
 * @author Steve Keylon
 */

class UserEmployeeToSupervisor extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_employee_to_supervisor';

	public function create(	$nUserId, $nSupervisorId ) {
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nUserId) ){
			add_error('User Id: ' . $nUserId, $key);
			return false;
		}
		if ( !is_numeric($nSupervisorId) ) {
			add_error('Supervisor Id: ' . $nSupervisorId, $key);
			return false;
		}

		// Get New Activity Id
		$nSupervisorIndex = $this->count_index( $nUserId ) + 1;

		// Other Records exist, ensure they are inactive
		if ( $nSupervisorIndex > 1 ) {
			$this->remove_from_Supervisor( $nUserId, get_user_id() );
		}

		// Save Data
		$this->set( 'user_id', $nUserId );
		$this->set( 'supervisor_id', $nSupervisorId );
		$this->set( 'supervisor_index', $nSupervisorIndex );
		$this->set( 'active', 1 );

		$this->set( 'start_date', date('Y-m-d') );

		$this->save();

		return TRUE;
	}

	public function count_index($nUserId) {
		$this->where('user_id', '=', $nUserId);
		return count($this->list()->rows);
	}

}

?>