<?php
/**
 * Map fields of database model
 * @author jaredtlewis
 *
 */
class EquipmentToPostingCode_Fields {
	const EquipmentId = 'equipment_id';
	const PostingServiceId = 'posting_service_id';
	const PostingCode = 'posting_code';
	const CreatedBy = 'created_by_id';
	const CreatedAt = 'created_at';
	const UpdatedBy = 'updated_by_id';
	const UpdatedAt = 'updated_at';
}

/**
 * @author Reid Workman
 */
class EquipmentToPostingCode extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'equipment_to_posting_code';

	public function create(	$nEquipmentId, $nPostingServiceId, $sPostingCode, $nCreatedById ) {
		
		// Prep Variables (trim and substr)
		$sPostingCode = prep_var( $sPostingCode, 10 );
		
		// Validate Data
		if ( !number( $nEquipmentId, TRUE ) ) die('You must specify an Equipment Id');
		if ( !number( $nPostingServiceId, TRUE ) ) die('You must specify a Posting Service Id');
		if ( !string( $sPostingCode, TRUE ) ) die('You must provide a Posting Code');
		
		if ( !number( $nCreatedById, TRUE ) ) die('You must specify a Created By User Id');
		
		// Save Data
		$this->set( 'equipment_id', $nEquipmentId );
		$this->set( 'posting_service_id', $nPostingServiceId );
		$this->set( 'posting_code', $sPostingCode );

		$this->set( 'created_by_id', $nCreatedById );
		$this->set( 'created_at', time() );
		
		$this->save();
		
		// Report
		return ;
	}
}
?>