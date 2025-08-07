<?php 
/**
 * Posting To Service
 *
 * @author eizzn
 */

class PostingToService extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'posting_to_service';

	public function create( $nPostingId, $nServiceId, $nStatusId, $nCreatedById ) {
		// Validate input
		$key = __CLASS__ . '::' . __METHOD__;
		if ( !is_numeric($nPostingId) ) {
			add_error('Customer id: '. $nPostingId, $key);
			return FALSE;
		}
		if ( !is_numeric($nServiceId) ) {
			add_error('Service Id: ' . $nServiceId, $key . ' must be a number');
			return FALSE;
		}
		if ( !is_numeric($nStatusId) ) {
			add_error('Status Id: ' . $nStatusId, $key . ' must be a number');
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('Created By Id: ' . $nCreatedById, $key);
			return FALSE;
		}
		
		// Save Input
		$this->set_posting_id( $nPostingId );
		$this->set_service_id( $nServiceId );
		$this->set_active( $nStatusId );
		$nCreatedById = $this->get_created_by_id();
		$vCreate = empty( $nCreatedId ) ;
		if( $vCreate ) $this->set_created_by_id($nCreatedById);
		else{ // Account for using this function as an edit function
			$this->set_updated_by_id($nCreatedById);
			$this->set_updated_at(time());
		}
		$this->save();
		
		// Report
		return true;
	}
}
?>