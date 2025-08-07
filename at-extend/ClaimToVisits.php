<?php 
/**
 * Claim to Visits
 *
 * @author Steve Keylon
 */
 
class ClaimToVisits extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'claim_to_visits';

	public function create(	$nClaimId, $nVisitId, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nClaimId) ) return FALSE;
		if ( !is_numeric($nVisitId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_claim_id($nCarrierId);
		$this->set_visit_id($nVisitId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>