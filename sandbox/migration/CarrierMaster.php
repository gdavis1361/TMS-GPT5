<?php 
/**
 * Fake CarrierMaster class
 */
 
class CarrierMaster extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'CarrierMaster';

	public function create(	$sName, $sMcNumber, $sSafetyRating, $sSafetyRatingDate, $sCommonAuthority, 
							$sContractAuthority, $sBrokerAuthority, $nCreatedById ) {
		
		$key = __CLASS__ . '::' . __METHOD__;
		// Validate Data
		if ( !is_string($sName) ) {
			add_error('Missing String - $sName', $key);
			return FALSE;
		}
		if ( !is_string($sMcNumber) ) {
			add_error('Missing String - $sMcNumber', $key);
			return FALSE;
		}
		if ( !is_string($sSafetyRating) ) {
			add_error('missing string - ' . $sSafetyRating, $key);
			return FALSE;
		}
		if ( !is_string($sSafetyRatingDate) ) {
			add_error('Missing String - '.var_dump($sSafetyRatingDate), $key);
			return FALSE;
		}
		if ( !is_string($sCommonAuthority) ) {
			add_error('missing string - $nCommonAuthority', $key);
			return FALSE;
		}
		if ( !is_string($sContractAuthority) ) {
			add_error('missing string - $nContractAuthority', $key);
			return FALSE;
		}
		if ( !is_string($sBrokerAuthority) ) {
			add_error('missing string - $nBrokerAuthority', $key);
			return FALSE;
		}
		if ( !is_numeric($nCreatedById) ) {
			add_error('missing numeric - $nCreatedById', $key);
			return FALSE;
		}
		
		// Save Data
		$sName = LP_Db::escape($sName);
		$this->connect();
		$s = "
		INSERT INTO CarrierMaster
			(CarrInsEnforce,CarrHazmat,CarrCWT,CarrHazmatCont,CarrCreatedBy,CarrDateCreated,CarrDateLastEdit,CarrMode,CarrName) 
			VALUES ('0' , '0' , '0' , '0' , 'Migration' , '". date('Y-m-d')."' , '". date('Y-m-d')."' , '1' , '". $sName ."');
			
			SELECT @@IDENTITY AS ID;";
		$oRes = $this->query($s);
		
		$nCarrierId = 0;
		if ( $oRes ) {
			$oRow = $this->db->fetch_object($oRes);
			$nCarrierId = $oRow->ID;
		}
		if ( !$nCarrierId || !is_numeric($nCarrierId) ) {
			add_error('Invalid Insert ID from CarrierMaster', $key);
			return FALSE;
		}
		
		$o = new CarrierBaseExtended();
		
		$nCommonAuthority = $sCommonAuthority == 'A' ? 1 : 0;
		$nContractAuthority = $sContractAuthority == "A" ? 1 : 0;
		$nBrokerAuthority = $sBrokerAuthority == "A" ? 1 : 0;
		
		$this->set('carrier_id', $nCarrierId);
		return $o->create( $nCarrierId, $sMcNumber, $sSafetyRating, $sSafetyRatingDate, $nCommonAuthority,
							$nContractAuthority, $nBrokerAuthority,	$nCreatedById );
	}
    
}

?>
