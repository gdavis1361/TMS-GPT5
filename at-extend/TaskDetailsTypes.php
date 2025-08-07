<?php 
/**
 * @author Reid Workman
 */
 
class TaskDetailsTypes extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'task_details_types';

	public function create(	$sType, $nCreatedById ) {
		// Prep Variables (trim and substr)
		$sType = prep_var($sType, 150);
		
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
			
		if ( !string( $sType, TRUE ) ) {
			add_error('Task Detail Type Name must be a string', $key);
			return FALSE;
		}
		
		if ( !number( $nCreatedById, TRUE ) ) {
			add_error('You must provide a Created By Id', $key);
			return FALSE;
		}
		
		// Save Data
		$this->set( 'task_details_type_name', $sType );
		
		$this->set( 'created_at', time() );
		$this->set( 'created_by_id', $nCreatedById );
		
		$this->save();
		
		// Report
		return true;
	}

	public function get_id_by_type_name( $sType ) {
		// Prep Variables (trim and substr)
		$sType = prep_var($sType, 150);
		
		// %contact_name% %contact_first_name% %contact_last_name%
		
		$this->where( 'lower(task_details_type_name)', '=', strtolower($sType) );
		$o = $this->list();
		
		if ( count($o->rows) > 0 ) {
			return $o->rows[0]->get('task_details_type_id');
		}
		
		return FALSE;
	}
}
?>