<?php 

/**
 * Location Comments
 *
 * @author Reid Workman
 */

class LocationComments extends DBModel {

	var $m_sTableName = 'location_comments';
	
	public function save() {
		
		if ( !$nUserId = session('user_id') ) {
			trigger_error('Could not save, User Id was not found.');
		}
		
		if ( !is_loaded() ) {
			$this->set( 'created_by_id', session('user_id') );
			$this->set( 'created_at',    time() );
		}
		else {
			$this->set( 'updated_by_id', session('user_id') );
			$this->set( 'updated_at',    time() );
		}
		parent::save();
	}

	public function create( $nLocationId, $sComment, $nCommentIndex ) {
		if ( !is_numeric($nLocationId) ) return FALSE;
		if ( !is_numeric($nCommentIndex) ) return FALSE;
		if ( empty($sComment) ) return FALSE;
		
		$this->set( 'created_at',    time() );
		$this->set( 'location_id',   $nLocationId );
		$this->set( 'comment',       $sComment );
		
		// From PreOrderStops to update indexes
		$Sql = 	"UPDATE " . $this->m_sTableName . " " . 
				"SET comment_index = ( comment_index + 1 ) " .
				"WHERE location_id = ?" .
				" AND comment_index >= ?";
		$this->db->query($Sql, array($nLocationId, $nCommentIndex));
		
		$this->set( 'comment_index', $nCommentIndex );
		$this->save();
	}
	
}

?>