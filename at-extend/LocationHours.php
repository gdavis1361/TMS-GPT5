<?php 

/**
 * Location Hours
 *
 * @author Reid Workman
 */

class LocationHours extends DBModel {

	var $m_sTableName = 'location_hours';
	
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
	
	public function create( $nLocationId, $sOpenTime, $sCloseTime, $nDayIndex, $nHoursIndex ) {
		if ( !is_numeric($nLocationId) ) return FALSE;
		if ( !is_numeric($nDayIndex) ) return FALSE;
		if ( !is_numeric($nHoursIndex) ) return FALSE;
		if ( empty($sOpenTime) ) return FALSE;
		if ( empty($sCloseTime) ) return FALSE; 
		
		$this->set( 'location_id',   $nLocationId );
		$this->set( 'day_index',     $sOpenTime );
		$this->set( 'hours_seq',     $sCloseTime );
		$this->set( 'open_time',     $sOpenTime );
		$this->set( 'close_time',    $sCloseTime );
		
		$Sql = 	"UPDATE " . $this->m_sTableName . " " . 
				"SET hours_seq = ( hours_seq + 1 ) " .
				"WHERE location_id = ?" .
				" AND day_index = ?" .
				" AND hours_seq >= ?";
		$this->db->query($Sql, array($nLocationId, $nDayIndex, $nHoursIndex));
		
		$this->set( 'comment_index', $nCommentIndex );
		return $this->save();
	}
	
}

?>