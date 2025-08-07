<?php 
/**
 * Tender Load Details
 *
 * @author Reid Workman
 */
 
class TenderLoadDetails extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_load_details';

	public function create(	$nTenderLoadId, 
							$nDetailIndex, $nDetailType, $sDetailValue,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nTenderLoadId) ) return FALSE;
		if ( !is_numeric($nDetailIndex) ) return FALSE;
		if ( !is_numeric($nDetailType) ) return FALSE;
		if ( !is_string($sDetailValue) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'tender_load_id', $nTenderLoadId );
		$this->set( 'detail_index', $nDetailIndex );
		$this->set( 'detail_type', $nDetailType );
		$this->set( 'detail_value', $sDetailValue );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>