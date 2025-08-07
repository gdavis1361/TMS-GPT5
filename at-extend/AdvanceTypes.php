<?php 
/**
 * @author Reid Workman
 */
 
class AdvanceTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'advance_types';

	public function create(	$sAdvanceTypeName ) {
		// Prep Variables (trim and substr)
		$sAdvanceTypeName = prep_var($sAdvanceTypeName, 50);
		
		// Validate Data
		$key = _CLASS_ . '::' . _METHOD_;
		
		if ( !string( $sAdvanceTypeName, TRUE ) ) {
			add_error('You must provide a name for Advance Type', $key);
			return FALSE;
		}
		
		// Save Data
		$this->set( 'advance_type_name', $sAdvanceTypeName );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>