<?php 
/**
 * Tender Queue
 *
 * @author Reid Workman
 */
 
class TenderQueue extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tender_queue';

	public function create(	$nLoadTenderId, $nQueueIndex, $nCarrierId,
	 						$sTotalRate, $sFuelRate, $sLinehaulRate, $sAccessorialRate,
							$nCreatedById
						  ) {
		// Validate Data
		if ( !is_numeric($nLoadTenderId) ) return FALSE;
		if ( !is_numeric($nQueueIndex) ) return FALSE;
		if ( !is_numeric($nCarrierId) ) return FALSE;
		if ( !is_string($sTotalRate) ) return FALSE;
		if ( !is_string($sFuelRate) ) return FALSE;
		if ( !is_string($sLinehaulRate) ) return FALSE;
		if ( !is_string($sAccessorialRate) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'tender_load_id', $nLoadTenderId );
		$this->set( 'queue_index', $nQueueIndex );
		$this->set( 'carrier_id', $nCarrierId );
		$this->set( 'total_rate', $sTotalRate );
		$this->set( 'fuel_rate', $sFuelRate );
		$this->set( 'linehaul_rate', $sLinehaulRate );
		$this->set( 'accessorial_rate', $sAccessorialRate );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>