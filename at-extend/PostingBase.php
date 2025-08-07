<?php 
/**
 * Posting Base
 *
 * @author eizzn
 */

class PostingBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'posting_base';

	public function create( $nUserId ) {
		// Validate input
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric( $nUserId ) ) {
			add_error( 'Created By Id: ' . $nUserId, $key );
			return FALSE;
		}
		
		// Save Input
		$nCreatedById = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId );
		if( $vCreate ){
			$this->set_created_by_id( $nUserId );
			$this->set_created_at( time() );
		}
		else { // Account for using this function as an edit function
			$this->set_updated_by_id( $nCreatedById );
			$this->set_updated_at( time() );
		}
		$this->save();
		
		// Report
		return true;
	}
	
	/**
	 * set all the items in posting_to_service related to this posting_base to inactive
	 * $param none
	 * #return bool (true = success false = failure)
	 */
	public function cancel(){
		$nPostingId = $this->get_posting_id();
		if( empty( $nPostingId ) ) return false;
		
		$sQuery = "UPDATE posting_to_service SET active = 0 WHERE posting_id = $nPostingId";
		$this->connect();
		$this->query( $sQuery );

		return true;
	}
}
?>