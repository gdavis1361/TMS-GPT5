<?php 
/**
 * Tools Sources
 *
 * @author Reid Workman
 */
 
class ToolsSources extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'tools_sources';

	public function create(	$sSourceName, $nCreatedById ) {
		// Validate Data
		if ( !is_string($sSourceName) ) return FALSE;
		if ( !is_numeric($nCreatedById) ) return FALSE;
		
		// Save Data
		$this->set( 'source_name', $sSourceName );
		
		$this->set( 'created_by_id', $nCreatedById ); 
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}

?>