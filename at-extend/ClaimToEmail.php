<?php 
/**
 * Claim to Emails
 *
 * @author Steve Keylon
 */
 
class ClaimToEmail extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'claim_to_email';

	public function create(	$nClaimId, $nEmailId, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nClaimId) ) return FALSE;
		if ( !is_numeric($nEmailId) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_claim_id($nCarrierId);
		$this->set_email_id($nEmailId);
		$this->set_created_by_id($nCreatedById); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>