<?php 
/**
 * Tender Load Accessorials
 *
 * @author Reid Workman
 */
 
class TenderLoadAccessorials extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_load_accessorials';

	public function create(	$nTenderLoadId, $nAccessorialIndex, 
							$nAccessorialQty, $nUnitId, $sAccessorialPerUnit,
							$nPayTo, $sAccessorialTotalCharge, $sAccessorialDesc,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nTenderLoadId) ) return FALSE;
		if ( !is_numeric($nAccessorialIndex) ) return FALSE;
		if ( !is_numeric($nAccessorialQty) ) return FALSE;
		if ( !is_numeric($nUnitId) ) return FALSE;
		if ( !is_string($sAccessorialPerUnit) ) return FALSE;
		if ( !is_numeric($nPayTo) ) return FALSE;
		if ( !is_string($sAccessorialTotalCharge) ) return FALSE;
		if ( !is_string($sAccessorialDesc) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'tender_load_id', $nTenderLoadId );
		$this->set( 'accessorial_index', $nAccessorialIndex );
		$this->set( 'accessorial_qty', $nAccessorialQty );
		$this->set( 'unit_id', $nUnitId );
		$this->set( 'accessorial_per_unit', $sAccessorialPerUnit );
		$this->set( 'pay_to', $nPayTo );
		$this->set( 'accessorial_total_change', $sAccessorialTotalCharge );
		$this->set( 'accessorial_desc', $sAccessorialDesc );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>