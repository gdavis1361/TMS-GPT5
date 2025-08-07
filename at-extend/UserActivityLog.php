<?php 
/**
 * User Activity Log
 *
 * @author Reid Workman
 */
 
class UserActivityLog extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'user_activity_log';

	public function create(	$nUserId, $nSessionId, $nPageId,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nUserId) ) return FALSE;
		if ( !is_numeric($nSessionId) ) return FALSE;
		if ( !is_numeric($nPageId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Get New Activity Id
		$nActivityIndex = $this->current_index( $nUserId, $nSessionId ) + 1;
		
		// Save Data
		$this->set( 'user_id', $nUserId );
		$this->set( 'session_id', $nSessionId );
		$this->set( 'activity_index', $nActivityIndex );
		$this->set( 'page_id', $nPageId );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
	
	public function current_index( $nUserId, $nSessionId ) {
		$res = $this->query('
			SELECT max(activity_index) as LAST_ID
			FROM '.$this->m_sTableName.'
			WHERE user_id = '.$nUserId.'
				  sess_id = '.$nSessionId.'
		');
		if ( $this->db->num_rows($res) > 0 && $row = $this->db->fetch_object($res) ) {
			return $row->LAST_ID;
		}
		else {
			return 0;
		}
	}
}

?>