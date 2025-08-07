<?php 
/**
 * Tender Status
 *
 * @author Reid Workman
 */
 
class TenderStatus extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_status';

	public function create(	$nLoadTenderId, $nLoadTenderIndex, $nCarrierId,
	 						$sTenderDate, $nStatusId, $sTenderKey,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nLoadTenderId) ) return FALSE;
		if ( !is_numeric($nLoadTenderIndex) ) return FALSE;
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_string($sTenderDate) ) return FALSE;
		if ( !is_numeric($nStatusId) ) return FALSE;
		if ( !is_string($sTenderKey) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'tender_load_id', $nLoadTenderId );
		$this->set( 'load_tender_index', $nLoadTenderIndex );
		$this->set( 'carrier_id', $nCarrierId );
		$this->set( 'tender_date', $sTenderDate );
		$this->set( 'status_id', $nStatusId );
		$this->set( 'tender_key', $sTenderKey );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>