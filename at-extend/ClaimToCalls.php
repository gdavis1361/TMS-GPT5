<?php 
/**
 * Claim to Calls
 *
 * @author Steve Keylon
 */
 
class ClaimToCalls extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'claim_to_calls';

	public function create(	$nClaimId, $nCallId, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nClaimId) ) return FALSE;
		if ( !is_numeric($nCallId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_claim_id($nCarrierId);
		$this->set_call_id($nCallId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>