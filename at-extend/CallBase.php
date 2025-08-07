<?php 
/**
 * @author Reid Workman
 */
 
class CallBase extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'call_base';

	public function call_start(	$sCallPbxId, $sCallDirection, 
							$sExtCallNumber, $nExtension, $nCallStartTime, 
							$nUserId ) {
		// Prep Variables (trim and substr)
		$sCallPbxId = prep_var($sCallPbxId, 50);
		$sCallDirection = prep_var($sCallDirection, 1);
		$sExtCallNumber = prep_var($sExtCallNumber, 25);
		$nExtension = prep_var($nExtension, 4);
		
		// Validate Data
		$key = _CLASS_ . '::' . _METHOD_;
		
		if ( !string( $sCallPbxId, TRUE ) ) {
			add_error('You must provide the Unique PBX Call Id', $key);
			return FALSE;
		}
		if ( !string( $sCallDirection, TRUE ) ) {
			add_error('You must specify if the direction is `I`(Incoming) or `O` (Outgoing)', $key);
			return FALSE;
		}
		if ( !string( $sExtCallNumber, TRUE ) ) {
			add_error('You must provide the Call number', $key);
			return FALSE;
		}
		if ( !number( $nExtension, TRUE ) ) {
			add_error('You must provide the extension', $key);
			return FALSE;
		}
		if ( !number( $nCallStartTime, TRUE ) ) {
			add_error('You must provide the call Start Time as a Unix Timestamp', $key);
			return FALSE;
		}
		
		if ( !number( $nUserId, TRUE ) ) {
			add_error('You must specify a User Id', $key);
			return FALSE;
		}
		// Get Date Id
		$oDate = new FantasyDates();
		$nDateId = $oDate->get_date( $nCallStartTime );
		
		
		// Save Data
		$this->set( 'call_pbx_id', $sCallPbxId );
		$this->set( 'call_direction', $sCallDirection );
		$this->set( 'ext_call_number', $sExtCallNumber );
		$this->set( 'int_extension', $nExtension );
		$this->set( 'call_start', $nCallStartTime );
		
		$this->set( 'date_id', $nDateId );
		$this->set( 'user_id', $nUserId );
		
		$this->save();
		
		// Report
		return ;
	}
	
	public function end_call( $sCallPbxId, $nCallEndTime ) {
		$sCallPbxId = prep_var($sCallPbxId, 50);
		
		if ( !string( $sCallPbxId, TRUE ) ) die('You must provide the Unique PBX Call Id');
		if ( !number( $nCallEndTime, TRUE ) ) die('You must provide the call End Time as a Unix Timestamp');
		
		$this->where( 'call_pbx_id', '=', $sCallPbxId ); 
		if ( $o = $this->fetch() ) {
			$nDuration = $nCallEndTime - strtotime($o->call_start);
			$o->set( 'call_pbx_id', $sCallPbxId );
			$o->set( 'call_end', $nCallEndTime );
			$o->set( 'call_duration_seconds', $nDuration );
		}
		
		$this->save();
		
		// Report
		return ;
	}
}
?>