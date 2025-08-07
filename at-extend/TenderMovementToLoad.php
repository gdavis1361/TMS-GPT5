<?php 
/**
 * Tender Movement to Load
 *
 * @author Reid Workman
 */
 
class TenderMovementToLoad extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_movement_to_load';

	public function create(	$nTenderLoadId, $nTenderMovementId, $nLoadIndex,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nTenderLoadId) ) return FALSE;
		if ( !is_numeric($nTenderMovementId) ) return FALSE;
		if ( !is_numeric($nLoadIndex) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'tender_load_id', $nTenderLoadId );
		$this->set( 'tender_movement_id', $nTenderMovementId );
		$this->set( 'load_index', $nLoadIndex );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>