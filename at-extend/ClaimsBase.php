<?php 
/**
 * Claims Base
 *
 * @author Steve Keylon
 */
 
class ClaimsBase extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'claims_base';

	public function create(	$nContactId, $nCarrierId, $nOrderId, $sClaimDate, $nClaimAmount, 
							$sClaimDesc, $nClaimAmountPaid, $nClaimAmountReceived, $vSettled, $nCreatedById ) {
		// Validate Data
		if ( !is_numeric($nContactId) ) return FALSE;
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_numeric($nOrderId) ) return FALSE;
		if ( !is_string($sClaimDate) ) return FALSE;
		if ( !is_numeric($nClaimAmount) ) return FALSE;
		if ( !is_string($sClaimDesc) ) return FALSE;
		if ( !is_numeric($nClaimAmountPaid) ) return FALSE;
		if ( !is_numeric($nClaimAmountReceived) ) return FALSE;
		if ( !is_bool($vSettled) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set_contact_id($nContactId);
		$this->set_carrier_id($nCarrierId);
		$this->set_Order_id($nOrderId);
		$this->set_claim_date($sClaimDate); 
		$this->set_claim_amount($nClaimAmount); 
		$this->set_claim_desc($sClaimDesc); 
		$this->set_claim_amount_paid($nClaimAmountPaid); 
		$this->set_claim_amount_received($nClaimAmountReceived); 
		$this->set_settled($vSettled ? 1 : 0); 
		$this->set_created_at(time());
		
		$this->save();
		
		// Report
		return ;
	}
}

?>