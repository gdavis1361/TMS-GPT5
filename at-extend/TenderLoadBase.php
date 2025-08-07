<?php 
/**
 * Tender Load Base
 *
 * @author Reid Workman
 */
 
class TenderLoadBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_load_base';

	public function create(	$nCarrierId, $nStatusId, $vTeamUsed,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_numeric($nStatusId) ) return FALSE;
		if ( !is_bool($vTeamUsed) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'carrier_id', $nCarrierId );
		$this->set( 'status_id', $nStatusId );
		$this->set( 'team_used', $vTeamUsed );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>