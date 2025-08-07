<?php 
/**
 * Tender Load Comments
 *
 * @author Reid Workman
 */
 
class TenderLoadComments extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_load_comments';

	public function create(	$nTenderLoadId, $sComment,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nTenderLoadId) ) return FALSE;
		if ( !is_string($sComment) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'tender_load_id', $nTenderLoadId );
		$this->set( 'comment', $sComment );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>