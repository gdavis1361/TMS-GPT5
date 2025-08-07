<?php 
/**
 * Tender Movement Details
 *
 * @author Reid Workman
 */
 
class TenderMovementDetails extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_movement_details';

	public function create(	$nTenderMovementId, $nDetailIndex, $nDetailType,
							$sDetailValue,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nTenderMovementId) ) return FALSE;
		if ( !is_numeric($nDetailIndex) ) return FALSE;
		if ( !is_numeric($nDetailType) ) return FALSE;
		if ( !is_string($sComment) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'tender_movement_id', $nTenderMovementId );
		$this->set( 'detail_index', $nDetailIndex );
		$this->set( 'detail_type', $nDetailType );
		$this->set( 'comment', $sComment );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>