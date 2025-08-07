<?php 
/**
 * @author Reid Workman
 */
 
class DocumentTypeGroups extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'document_type_groups';
	
	const Order = 2;
	const Carrier = 3;
	const Customer = 4;
	const Employee = 5;

	public function create(	$sGroupName, $vActive = TRUE, $nCreatedById ) {
		// Prep Variables (trim and substr)
		$sGroupName = prep_var( $sGroupName, 50 );
		
		// Validate Data
		if ( !string( $sGroupName, TRUE ) ) die('You must provide a name');
		if ( !is_bool($vActive) )  die('Active flag must be a boolean');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'group_name', $sGroupName );
		$this->set( 'active', $vActive );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}