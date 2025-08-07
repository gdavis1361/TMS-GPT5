<?php 
/**
 * @author Reid Workman
 */
 
class TaskTypes extends DBModel {

	public $m_sClassName = __CLASS__;
	public $m_sTableName = 'task_types';

	public function create(	$sTaskName, $sTaskDescription, $sTaskUrl ) {
		// Prep Variables (trim and substr)
		$sTaskName = prep_var($sTaskName, 150);
		$sTaskDescription = prep_var($sTaskDescription, 500);
		$sTaskUrl = prep_var($sTaskUrl);
		
		// Validate Data
		$key = __CLASS__ . '::' . __METHOD__;
	
		if ( !string( $sTaskName, TRUE ) ) {
			add_error('You must provide a Task Name', $key);
			return FALSE;
		}
		if ( !string( $sTaskDescription ) ) {
			add_error('You must provide a Task Description', $key);
			return FALSE;
		}
		if ( !string( $sTaskUrl, TRUE ) ) {
			add_error('You must provide a Task Url', $key);
			return FALSE;
		}
		
		// Save Data
		$this->set( 'task_name', $sTaskName );
		$this->set( 'task_description', $sTaskDescription );
		$this->set( 'task_url', $sTaskUrl );
		
		$this->save();
		
		// Report
		return ;
	}

	public function get_type_by_task_id( $nTaskId, $nTaskTypeId = FALSE ) {
		$this->clear();
		
		if ( !$nTaskTypeId ) {
			$oTask = new TaskBase();
			if ( !$oTask->load($nTaskId) ) {
				return FALSE;
			}
			$nTaskTypeId = $oTask->get('task_type_id');
		}
		
		if ( $this->load( $nTaskTypeId ) ) {
			
			$oTaskDetails = new TaskDetails();
			$aRelations = $oTaskDetails->get_task_details( $nTaskId );
			
			$o = (object) '';
			$o->task_type_name        = $this->replace_hot_variables( $this->get('task_name'), $aRelations );
			$o->task_type_description = $this->replace_hot_variables( $this->get('task_description'), $aRelations );
			$o->task_type_url         = $this->replace_hot_variables( $this->get('task_url'), $aRelations );
			
			return $o;
		}
	}
	
	public function replace_hot_variables( $sString, $aRelations ){
		// Matches {Abc|def|j90}
		preg_match_all("/{[A-Za-z0-9_\|\-]+}/", $sString, $aMatches );
		
		if ( count($aMatches[0]) > 0 ) {
			foreach ( $aMatches[0] as $sData ) {
				$sData2 = substr($sData, 1, strlen($sData)-2 );
				if ( strpos($sData2, "|") ) {
					$aVariableParams = explode('|', $sData2);
					if ( isset($aRelations[$aVariableParams[1]]) ) {
						$o = new $aVariableParams[0];
						$o->load( $aRelations[$aVariableParams[1]] );
						$sString = str_replace($sData, $o->get( $aVariableParams[2] ), $sString);
						unset($o);
					}
				} else {
					if ( isset($aRelations[$sData2]) ) {
						$sString = str_replace($sData, $aRelations[$sData2], $sString);
					}
				}
			}
		}
		
		return $sString;
	}
	
	public static function replaceTags($str, $relations) {
		// Matches {Abc|def|j90}
		preg_match_all("/{[A-Za-z0-9_\|\-]+}/", $str, $aMatches );
		
		if ( count($aMatches[0]) > 0 ) {
			foreach ( $aMatches[0] as $sData ) {
				$sData2 = substr($sData, 1, strlen($sData)-2 );
				if ( strpos($sData2, "|") ) {
					$aVariableParams = explode('|', $sData2);
					if ( isset($relations[$aVariableParams[1]]) ) {
						$o = new $aVariableParams[0];
						$o->load( $relations[$aVariableParams[1]] );
						$str = str_replace($sData, $o->get( $aVariableParams[2] ), $str);
						unset($o);
					}
				} else {
					if ( isset($relations[$sData2]) ) {
						$str = str_replace($sData, $relations[$sData2], $str);
					}
				}
			}
		}
		
		return $str;
	}
}