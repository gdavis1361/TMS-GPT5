<?php 
/**
 * @author Reid Workman
 */
 
class TaskDetails extends DBModel {

	var $m_sClassName = __CLASS__;
	var $m_sTableName = 'task_details';

	public function create(	$nTaskId, $sType, $nValueId, $nCreatedById ) {
		
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
			
		if ( !number( $nTaskId, TRUE ) ) {
			add_error('You must provide a Task Id to reference', $key);
			return FALSE;
		}
		if ( !string( $sType, TRUE ) ) {
			add_error('You must provide a Value Type Name', $key);
			return FALSE;
		}
		if ( empty( $nValueId ) ) {
			add_error('You must provide a value id', $key);
			return FALSE;
		}
		
		if ( !number( $nCreatedById, TRUE ) ) {
			add_error('You must provide a Created By Id', $key);
			return FALSE;
		}
		
		
		// Get New Index
		$nTaskDetailIndex = $this->current_index( $nTaskId ) + 1;
		
		
		// Get or Create Type Name
		$oTaskDetailsTypes = new TaskDetailsTypes();
		if ( !$nTypeId = $oTaskDetailsTypes->get_id_by_type_name( $sType ) ) {
			$oTaskDetailsTypes->create( $sType, $nCreatedById );
			$nTypeId = $oTaskDetailsTypes->get('task_details_type_id');
		}
		
		// Save Data
		$this->set( 'task_id', $nTaskId );
		$this->set( 'task_details_index', $nTaskDetailIndex );
		$this->set( 'task_details_type_id', $nTypeId );
		$this->set( 'task_details_value', $nValueId );
		
		$this->save();
		
		// Report
		return true;
	}
	
	
	public function current_index( $nTaskId ) {
		if ( !$this->is_connected() ) $this->connect();
		
		$res = $this->query('
			SELECT max(task_details_index) as LAST_ID
			FROM '.$this->m_sTableName.'
			WHERE task_id = '.$nTaskId.'
		');
		if ( $this->db->num_rows($res) > 0 && $row = $this->db->fetch_object($res) ) {
			return $row->LAST_ID;
		}
		else {
			return 0;
		}
	}
	
	public function get_task_details( $nTaskId ) {
		if ( !is_numeric($nTaskId) ) {
			return FALSE;
		}
		
		$this->connect();
		$oRes = $this->db->query("
			SELECT 
				task_details.task_details_value,
				task_details_types.task_details_type_name
			FROM
				task_details
			JOIN task_details_types ON ( task_details_types.task_details_type_id = task_details.task_details_type_id )
			WHERE 
				task_id = ".$this->db->escape($nTaskId)."
		");
		
		$aDetails = array();
		
		while( $oRow = $this->db->fetch_object($oRes) ) {
			$aDetails[$oRow->task_details_type_name] = $oRow->task_details_value;
		}
		
		return $aDetails;
		
	}
	
	public static function getTaskDetails($nTaskId) {
		if ( !is_numeric($nTaskId) ) {
			return FALSE;
		}
		
		$dbModel = new DBModel();
		$dbModel->connect();
		$oRes = $dbModel->db->query("
			SELECT 
				task_details.task_details_value,
				task_details_types.task_details_type_name
			FROM
				task_details
			JOIN task_details_types ON ( task_details_types.task_details_type_id = task_details.task_details_type_id )
			WHERE 
				task_id = ".$dbModel->db->escape($nTaskId)."
		");
		
		$aDetails = array();
		
		while( $oRow = $dbModel->db->fetch_object($oRes) ) {
			$aDetails[$oRow->task_details_type_name] = $oRow->task_details_value;
		}
		
		return $aDetails;
	}
	
}