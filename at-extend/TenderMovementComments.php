<?php 
/**
 * Tender Movement Comments
 *
 * @author Reid Workman
 */
 
class TenderMovementComments extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_movement_comments';

	public function create(	$nTenderMovementId,
							$sComment,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nTenderMovementId) ) return FALSE;
		if ( !is_string($sComment) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'tender_movement_id', $nTenderMovementId );
		$this->set( 'comment', $sComment );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>